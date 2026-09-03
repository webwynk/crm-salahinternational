<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Inventory;
use App\Models\Labour;
use App\Models\Material;
use App\Models\MaterialVariant;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\AssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentStatusTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Labour $labour;
    protected Product $product;
    protected Material $material;
    protected MaterialVariant $variant;
    protected Inventory $inventory;
    protected AssignmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AssignmentService();
        $this->admin = User::factory()->create(['role' => 'ADMIN']);

        $this->labour = Labour::create([
            'name' => 'Artisan Worker',
            'phone' => '0987654321',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'code' => 'WALLET-BLK-01',
            'name' => 'Classic Black Wallet',
            'created_by' => $this->admin->id,
        ]);

        $this->material = Material::create([
            'name' => 'Full-Grain Black Cowhide',
            'category' => 'LEATHER',
            'base_unit' => 'sq m',
            'reorder_level' => 10,
        ]);

        $this->variant = $this->material->variants()->create([
            'name' => 'Standard',
            'reorder_level' => 10,
            'is_active' => true,
        ]);

        $this->inventory = Inventory::create([
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'quantity_on_hand' => 100.0,
            'unit' => 'sq m',
        ]);

        // BOM: 0.5 sq m per wallet (for 10 wallets = 5.0 sq m needed)
        $this->product->materials()->create([
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Outer Cover',
            'quantity_min' => 0.5,
            'quantity_max' => 0.5,
            'unit' => 'sq m',
            'sort_order' => 1,
        ]);
    }

    public function test_admin_can_mark_assignment_completed_via_http_route(): void
    {
        $this->actingAs($this->admin);

        // 1. Create Assignment (100 - 5 = 95 sq m remaining)
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $this->assertEquals('ASSIGNED', $assignment->status);
        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);

        // 2. HTTP PATCH to status endpoint -> COMPLETED
        $response = $this->patch("/assignments/{$assignment->id}/status", [
            'status' => 'COMPLETED',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $assignment->refresh();
        $this->assertEquals('COMPLETED', $assignment->status);
        $this->assertNotNull($assignment->completed_at);

        // Materials must remain deducted at 95.0
        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);
    }

    public function test_admin_can_cancel_assignment_and_stock_is_refunded_via_http_route(): void
    {
        $this->actingAs($this->admin);

        // 1. Create Assignment (100 - 5 = 95 sq m remaining)
        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);

        // 2. HTTP PATCH to status endpoint -> CANCELLED
        $response = $this->patch("/assignments/{$assignment->id}/status", [
            'status' => 'CANCELLED',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $assignment->refresh();
        $this->assertEquals('CANCELLED', $assignment->status);

        // 3. Stock MUST BE REFUNDED back to 100.0 in the database
        $this->assertEquals(100.0, (float) $this->inventory->fresh()->quantity_on_hand);

        // 4. Audit trail must have RESTOCK transaction with +5.0 change
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->material->id,
            'material_variant_id' => $this->variant->id,
            'change_qty' => 5.0,
            'type' => StockTransaction::TYPE_RESTOCK,
            'reference_id' => $assignment->id,
            'balance_after' => 100.0,
        ]);
    }

    public function test_cannot_alter_already_completed_or_cancelled_assignment(): void
    {
        $this->actingAs($this->admin);

        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        // Mark COMPLETED
        $this->patch("/assignments/{$assignment->id}/status", ['status' => 'COMPLETED']);
        $this->assertEquals('COMPLETED', $assignment->fresh()->status);

        // Attempting to cancel an already completed assignment should return warning and not change stock
        $response = $this->patch("/assignments/{$assignment->id}/status", ['status' => 'CANCELLED']);
        $response->assertSessionHas('warning');
        $this->assertEquals('COMPLETED', $assignment->fresh()->status);
        $this->assertEquals(95.0, (float) $this->inventory->fresh()->quantity_on_hand);
    }

    public function test_admin_can_download_work_order_pdf(): void
    {
        $this->actingAs($this->admin);

        $assignment = $this->service->createAssignment(
            $this->product->id,
            $this->labour->id,
            10,
            $this->admin->id
        );

        $response = $this->get("/assignments/{$assignment->id}/pdf");
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }
}
