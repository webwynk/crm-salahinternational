<?php

namespace Tests\Feature;

use App\Models\Cutter;
use App\Models\Inventory;
use App\Models\LeatherChallan;
use App\Models\Material;
use App\Models\MaterialVariant;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeatherChallanTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Cutter $cutter;
    protected Material $leather;
    protected MaterialVariant $variant;
    protected Product $productA;
    protected Product $productB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'ADMIN',
            'is_active' => true,
        ]);

        $this->cutter = Cutter::create([
            'name' => 'Rahim Cutting Master',
            'phone' => '9830123456',
            'address' => 'Topsia Road, Kolkata',
            'is_active' => true,
        ]);

        // Create Leather Material with Variant and Inventory Stock
        $this->leather = Material::create([
            'name' => 'Cow Hunter',
            'category' => 'COW HUNTER',
            'base_unit' => 'sq_ft',
            'is_leather' => true,
            'is_active' => true,
        ]);

        $this->variant = MaterialVariant::create([
            'material_id' => $this->leather->id,
            'name' => 'Black',
            'is_active' => true,
        ]);

        Inventory::create([
            'material_id' => $this->leather->id,
            'material_variant_id' => $this->variant->id,
            'quantity_on_hand' => 500.00,
            'unit' => 'sq_ft',
        ]);

        // Create Products with part_no and leather_sqft
        $this->productA = Product::create([
            'code' => 'PRD-101',
            'part_no' => 'CH-01',
            'name' => 'Classic Leather Card Holder',
            'leather_sqft' => 0.85,
            'is_active' => true,
        ]);

        $this->productB = Product::create([
            'code' => 'PRD-102',
            'part_no' => 'WL-05',
            'name' => 'Bi-Fold Wallet',
            'leather_sqft' => 1.50,
            'is_active' => true,
        ]);
    }

    public function test_can_view_leather_challan_create_screen(): void
    {
        $response = $this->actingAs($this->admin)->get(route('leather.challan.create'));
        $response->assertOk();
    }

    public function test_can_create_cutter_via_api(): void
    {
        $response = $this->actingAs($this->admin)->postJson(route('leather.cutters.store'), [
            'name' => 'Kareem Clicker',
            'phone' => '9876543210',
            'address' => 'Park Circus, Kolkata',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $this->assertDatabaseHas('cutters', ['name' => 'Kareem Clicker']);
    }

    public function test_can_create_leather_challan_and_deduct_stock(): void
    {
        // Product A: 50 pcs * 0.85 = 42.50 sq. ft
        // Product B: 30 pcs * 1.50 = 45.00 sq. ft
        // Total Sq. Ft = 87.50 sq. ft
        $response = $this->actingAs($this->admin)->post(route('leather.challan.store'), [
            'cutter_id' => $this->cutter->id,
            'material_id' => $this->leather->id,
            'material_variant_id' => $this->variant->id,
            'notes' => 'Sample test cutting challan',
            'items' => [
                [
                    'product_id' => $this->productA->id,
                    'quantity' => 50,
                    'leather_sqft_per_pc' => 0.85,
                ],
                [
                    'product_id' => $this->productB->id,
                    'quantity' => 30,
                    'leather_sqft_per_pc' => 1.50,
                ],
            ],
        ]);

        $response->assertRedirect(route('leather.challans.index'));

        // Verify Challan record was created
        $this->assertDatabaseHas('leather_challans', [
            'cutter_id' => $this->cutter->id,
            'material_id' => $this->leather->id,
            'material_variant_id' => $this->variant->id,
            'total_sqft' => 87.50,
            'status' => 'ISSUED',
        ]);

        // Verify Items were created
        $this->assertDatabaseHas('leather_challan_items', [
            'product_id' => $this->productA->id,
            'quantity' => 50,
            'total_sqft' => 42.50,
        ]);

        $this->assertDatabaseHas('leather_challan_items', [
            'product_id' => $this->productB->id,
            'quantity' => 30,
            'total_sqft' => 45.00,
        ]);

        // Verify Stock was deducted (500.00 - 87.50 = 412.50)
        $inv = Inventory::where('material_id', $this->leather->id)
            ->where('material_variant_id', $this->variant->id)
            ->first();

        $this->assertEquals(412.50, (float) $inv->quantity_on_hand);

        // Verify StockTransaction was recorded
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->leather->id,
            'material_variant_id' => $this->variant->id,
            'change_qty' => -87.50,
            'balance_after' => 412.50,
        ]);
    }

    public function test_rejects_challan_when_stock_is_insufficient(): void
    {
        // Request 1000 pcs of Product B * 1.50 = 1500 sq. ft (only 500 available)
        $response = $this->actingAs($this->admin)->from(route('leather.challan.create'))->post(route('leather.challan.store'), [
            'cutter_id' => $this->cutter->id,
            'material_id' => $this->leather->id,
            'material_variant_id' => $this->variant->id,
            'items' => [
                [
                    'product_id' => $this->productB->id,
                    'quantity' => 1000,
                    'leather_sqft_per_pc' => 1.50,
                ],
            ],
        ]);

        $response->assertRedirect(route('leather.challan.create'));
        $response->assertSessionHasErrors(['stock']);

        // Verify stock remains untouched at 500
        $inv = Inventory::where('material_id', $this->leather->id)->first();
        $this->assertEquals(500.00, (float) $inv->quantity_on_hand);
    }

    public function test_can_download_challan_pdf(): void
    {
        // First create a challan
        $this->actingAs($this->admin)->post(route('leather.challan.store'), [
            'cutter_id' => $this->cutter->id,
            'material_id' => $this->leather->id,
            'material_variant_id' => $this->variant->id,
            'items' => [
                [
                    'product_id' => $this->productA->id,
                    'quantity' => 10,
                    'leather_sqft_per_pc' => 0.85,
                ],
            ],
        ]);

        $challan = LeatherChallan::first();
        $this->assertNotNull($challan);

        $response = $this->actingAs($this->admin)->get(route('leather.challan.pdf', $challan->id));
        $response->assertOk();
    }

    public function test_can_cancel_challan_and_refund_stock(): void
    {
        // Create challan (10 * 0.85 = 8.5 sq. ft deducted)
        $this->actingAs($this->admin)->post(route('leather.challan.store'), [
            'cutter_id' => $this->cutter->id,
            'material_id' => $this->leather->id,
            'material_variant_id' => $this->variant->id,
            'items' => [
                [
                    'product_id' => $this->productA->id,
                    'quantity' => 10,
                    'leather_sqft_per_pc' => 0.85,
                ],
            ],
        ]);

        $challan = LeatherChallan::first();
        $invAfterIssue = Inventory::where('material_id', $this->leather->id)->first();
        $this->assertEquals(491.50, (float) $invAfterIssue->quantity_on_hand);

        // Cancel challan
        $response = $this->actingAs($this->admin)->post(route('leather.challan.cancel', $challan->id));
        $response->assertRedirect();

        // Verify status is CANCELLED
        $this->assertEquals('CANCELLED', $challan->fresh()->status);

        // Verify stock is refunded back to 500.00
        $invAfterCancel = Inventory::where('material_id', $this->leather->id)->first();
        $this->assertEquals(500.00, (float) $invAfterCancel->quantity_on_hand);
    }
}
