<?php

namespace Tests\Unit;

use App\Exceptions\InsufficientStockException;
use App\Models\Inventory;
use App\Models\Labour;
use App\Models\Material;
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

        Inventory::create([
            'material_id' => $this->material->id,
            'quantity_on_hand' => 1000,
            'unit' => 'cm2',
        ]);

        // BOM item: min=10, max=15 (worst case deduction = 15)
        $this->product->materials()->create([
            'material_id' => $this->material->id,
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
        Inventory::create([
            'material_id' => $liningMat->id,
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
        Inventory::create([
            'material_id' => $threadMat->id,
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
}
