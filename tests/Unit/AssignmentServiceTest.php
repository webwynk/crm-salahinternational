<?php

namespace Tests\Unit;

use App\Exceptions\InsufficientStockException;
use App\Models\Inventory;
use App\Models\Labour;
use App\Models\Material;
use App\Models\MaterialVariant;
use App\Models\Product;
use App\Models\User;
use App\Services\AssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AssignmentService $service;
    protected User $admin;
    protected Labour $labour;
    protected Product $product;
    protected Material $material;
    protected MaterialVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AssignmentService();

        $this->admin = User::factory()->create(['role' => 'ADMIN']);
        $this->labour = Labour::create([
            'name' => 'Test Craftsman',
            'phone' => '1234567890',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'code' => 'TEST-WAL-01',
            'name' => 'Test Wallet',
            'created_by' => $this->admin->id,
        ]);

        $this->material = Material::create([
            'name' => 'Calfskin Leather',
            'category' => 'LEATHER',
            'base_unit' => 'cm2',
            'reorder_level' => 100,
        ]);

        $this->variant = $this->material->variants()->create([
            'name' => 'Standard',
            'reorder_level' => 100,
            'is_active' => true,
        ]);

        Inventory::create([
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'quantity_on_hand' => 1000,
            'unit' => 'cm2',
        ]);

        // BOM item: min=10, max=15 (worst case deduction = 15)
        $this->product->materials()->create([
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Exterior Panel',
            'quantity_min' => 10,
            'quantity_max' => 15,
            'unit' => 'cm2',
            'sort_order' => 1,
        ]);
    }

    public function test_check_stock_availability_dry_run_returns_sufficient(): void
    {
        // 10 pcs * worst-case 15 cm2 = 150 cm2 needed (available 1000 cm2)
        $result = $this->service->checkStockAvailability($this->product->id, 10);

        $this->assertTrue($result['can_assign']);
        $this->assertCount(1, $result['items']);
        $this->assertEquals(150, $result['items'][0]['needed']);
        $this->assertEquals(1000, $result['items'][0]['available']);
        $this->assertTrue($result['items'][0]['is_sufficient']);
    }

    public function test_create_assignment_deducts_stock_in_transaction(): void
    {
        // Assign 10 pcs -> should deduct 150 cm2 (leaving 850 cm2)
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id,
            'Test Assignment Note'
        );

        $this->assertNotNull($assignment->assignment_no);
        $this->assertEquals('ASSIGNED', $assignment->status);

        $inventory = Inventory::where('material_id', $this->material->id)->first();
        $this->assertEquals(850, $inventory->quantity_on_hand);

        // Verify stock_transactions audit ledger entry created
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->material->id,
            'change_qty' => -150,
            'type' => 'ASSIGNMENT_DEDUCTION',
            'balance_after' => 850,
        ]);
    }

    public function test_create_assignment_with_variant_specific_deduction(): void
    {
        // Material with 2 variants: 'Tan' and 'Black'
        $leather = Material::create([
            'name' => 'Italian Buttero Leather',
            'category' => 'LEATHER',
            'base_unit' => 'sq m',
            'reorder_level' => 10,
        ]);

        $tanVariant = $leather->variants()->create([
            'name' => 'Tan',
            'sku' => 'BUT-TAN',
            'reorder_level' => 5,
        ]);
        $blackVariant = $leather->variants()->create([
            'name' => 'Black',
            'sku' => 'BUT-BLK',
            'reorder_level' => 5,
        ]);

        $tanInventory = Inventory::create([
            'material_id' => $leather->id,
            'material_variant_id' => $tanVariant->id,
            'quantity_on_hand' => 40.0,
            'unit' => 'sq m',
        ]);
        $blackInventory = Inventory::create([
            'material_id' => $leather->id,
            'material_variant_id' => $blackVariant->id,
            'quantity_on_hand' => 20.0,
            'unit' => 'sq m',
        ]);

        $tanCardholder = Product::create([
            'code' => 'CARD-TAN-01',
            'name' => 'Tan Cardholder',
            'created_by' => $this->admin->id,
        ]);

        $tanCardholder->materials()->create([
            'material_id' => $leather->id,
            'material_variant_id' => $tanVariant->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Tan Leather Shell',
            'quantity_min' => 0.5,
            'quantity_max' => 0.5,
            'unit' => 'sq m',
            'sort_order' => 1,
        ]);

        // Dry check for 10 units = 5 sq m needed
        $check = $this->service->checkStockAvailability($tanCardholder->id, 10);
        $this->assertTrue($check['can_assign']);
        $this->assertEquals(5.0, $check['items'][0]['needed']);
        $this->assertEquals(40.0, $check['items'][0]['available']);

        // Execute assignment
        $this->service->createAssignment(
            $tanCardholder->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        // Tan inventory should be 40 - 5 = 35 sq m
        $this->assertEquals(35.0, (float) $tanInventory->fresh()->quantity_on_hand);

        // Black inventory must remain untouched at 20 sq m
        $this->assertEquals(20.0, (float) $blackInventory->fresh()->quantity_on_hand);

        // Stock transaction must have material_variant_id linked to Tan variant
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $leather->id,
            'material_variant_id' => $tanVariant->id,
            'change_qty' => -5.0,
            'balance_after' => 35.0,
        ]);
    }

    public function test_create_assignment_throws_insufficient_stock_exception_when_stock_inadequate(): void
    {
        // 100 pcs * 15 cm2 = 1500 cm2 needed (only 1000 available)
        $this->expectException(InsufficientStockException::class);

        $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            100,
            $this->admin->id
        );
    }

    public function test_create_assignment_with_mixed_measurement_units_calculates_and_deducts_accurately(): void
    {
        // Material 1: Lining fabric measured in 'yard'
        $liningMat = Material::create([
            'name' => 'Silk Jacquard Lining',
            'category' => 'LINING',
            'base_unit' => 'yard',
            'reorder_level' => 10,
        ]);
        $liningVar = $liningMat->variants()->create(['name' => 'Standard']);
        Inventory::create([
            'material_id' => $liningMat->id,
            'material_variant_id' => $liningVar->id,
            'quantity_on_hand' => 50.000,
            'unit' => 'yard',
        ]);

        // Material 2: Thread measured in 'm'
        $threadMat = Material::create([
            'name' => 'Bonded Nylon Thread #69',
            'category' => 'THREAD',
            'base_unit' => 'm',
            'reorder_level' => 100,
        ]);
        $threadVar = $threadMat->variants()->create(['name' => 'Standard']);
        Inventory::create([
            'material_id' => $threadMat->id,
            'material_variant_id' => $threadVar->id,
            'quantity_on_hand' => 500.000,
            'unit' => 'm',
        ]);

        // Create product with BOM in yard & m
        $bagProduct = Product::create([
            'code' => 'TOTE-LUX-001',
            'name' => 'Luxury Leather Tote Bag',
            'created_by' => $this->admin->id,
        ]);

        // BOM 1: 0.75 yard lining per bag
        $bagProduct->materials()->create([
            'material_id' => $liningMat->id,
            'material_variant_id' => $liningVar->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Inner Lining Cut',
            'quantity_min' => 0.75,
            'quantity_max' => 0.75,
            'unit' => 'yard',
            'sort_order' => 1,
        ]);

        // BOM 2: 12.5 m thread per bag
        $bagProduct->materials()->create([
            'material_id' => $threadMat->id,
            'material_variant_id' => $threadVar->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Perimeter Stitch Thread',
            'quantity_min' => 12.5,
            'quantity_max' => 12.5,
            'unit' => 'm',
            'sort_order' => 2,
        ]);

        // Dry-run check for 20 bags
        // Lining needed: 20 * 0.75 = 15.000 yard (available: 50.000)
        // Thread needed: 20 * 12.5 = 250.000 m (available: 500.000)
        $preCheck = $this->service->checkStockAvailability($bagProduct->id, 20);
        $this->assertTrue($preCheck['can_assign']);
        $this->assertCount(2, $preCheck['items']);
        $this->assertEquals(15.000, $preCheck['items'][0]['needed']);
        $this->assertEquals('yard', $preCheck['items'][0]['unit']);
        $this->assertEquals(250.000, $preCheck['items'][1]['needed']);
        $this->assertEquals('m', $preCheck['items'][1]['unit']);

        // Execute Assignment
        $assignment = $this->service->createAssignment(
            $bagProduct->id,
            $this->labour->id,
            20,
            $this->admin->id,
            'Order for 20 Tote Bags with mixed units'
        );

        $this->assertEquals('ASSIGNED', $assignment->status);

        // Verify remaining inventory balances
        $this->assertEquals(35.000, (float) Inventory::where('material_id', $liningMat->id)->value('quantity_on_hand'));
        $this->assertEquals(250.000, (float) Inventory::where('material_id', $threadMat->id)->value('quantity_on_hand'));

        // Verify Stock Transactions
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $liningMat->id,
            'change_qty' => -15.000,
            'balance_after' => 35.000,
            'type' => 'ASSIGNMENT_DEDUCTION',
        ]);
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $threadMat->id,
            'change_qty' => -250.000,
            'balance_after' => 250.000,
            'type' => 'ASSIGNMENT_DEDUCTION',
        ]);
    }

    public function test_complete_assignment_sets_completed_status_and_timestamp(): void
    {
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $this->assertEquals('ASSIGNED', $assignment->status);
        $this->assertNull($assignment->completed_at);

        $completed = $this->service->completeAssignment($assignment);

        $this->assertEquals('COMPLETED', $completed->status);
        $this->assertNotNull($completed->completed_at);
    }

    public function test_cancel_assignment_refunds_stock_to_inventory_and_logs_transaction(): void
    {
        // 1000 initial, 10 pcs * 15 = 150 deducted -> 850 remaining
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $inv = Inventory::where('material_id', $this->material->id)->first();
        $this->assertEquals(850, $inv->quantity_on_hand);

        // Cancel assignment -> should refund 150 back to 1000
        $cancelled = $this->service->cancelAssignment($assignment, $this->admin->id);

        $this->assertEquals('CANCELLED', $cancelled->status);
        $this->assertEquals(1000, $inv->fresh()->quantity_on_hand);

        // Verify restock transaction logged
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->material->id,
            'change_qty' => 150,
            'type' => 'RESTOCK',
            'balance_after' => 1000,
            'reference_id' => $assignment->id,
        ]);
    }

    public function test_cancel_assignment_is_idempotent(): void
    {
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $inv = Inventory::where('material_id', $this->material->id)->first();
        $this->assertEquals(850, $inv->quantity_on_hand);

        // First cancel: refunds to 1000
        $this->service->cancelAssignment($assignment, $this->admin->id);
        $this->assertEquals(1000, $inv->fresh()->quantity_on_hand);

        // Second cancel call: should do nothing (idempotent)
        $this->service->cancelAssignment($assignment, $this->admin->id);
        $this->assertEquals(1000, $inv->fresh()->quantity_on_hand);
    }
}

