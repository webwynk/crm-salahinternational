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
}
