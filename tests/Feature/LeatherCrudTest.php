<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\AssignmentMaterial;
use App\Models\Inventory;
use App\Models\Labour;
use App\Models\Material;
use App\Models\MaterialVariant;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeatherCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create([
            'role' => 'ADMIN',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_view_leather_index_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('leather.index'));
        $response->assertOk();
    }

    public function test_admin_can_create_leather_hide_with_sq_ft(): void
    {
        $response = $this->actingAs($this->admin)->post(route('leather.store'), [
            'name'          => 'Tuscany Veg-Tan Leather',
            'category'      => 'Vegetable Tanned',
            'base_unit'     => 'sq_ft',
            'is_leather'    => true,
            'reorder_level' => 100,
            'initial_stock' => 0,
            'variants'      => [
                [
                    'name'          => 'Cognac Brown (1.4mm)',
                    'sku'           => 'LTH-COG-14',
                    'reorder_level' => 50,
                    'initial_stock' => 250,
                ],
                [
                    'name'          => 'Midnight Black (1.6mm)',
                    'sku'           => 'LTH-BLK-16',
                    'reorder_level' => 40,
                    'initial_stock' => 180,
                ],
            ],
        ]);

        $response->assertRedirect(route('leather.index'));

        $this->assertDatabaseHas('materials', [
            'name'       => 'Tuscany Veg-Tan Leather',
            'category'   => 'VEGETABLE TANNED',
            'base_unit'  => 'sq_ft',
            'is_leather' => true,
        ]);

        $this->assertDatabaseHas('material_variants', [
            'name' => 'Cognac Brown (1.4mm)',
            'sku'  => 'LTH-COG-14',
        ]);

        $this->assertDatabaseHas('inventory', [
            'quantity_on_hand' => 250,
            'unit'             => 'sq_ft',
        ]);
    }

    public function test_admin_can_restock_leather_variant(): void
    {
        $leather = Material::create([
            'name'          => 'Pull-Up Leather',
            'category'      => 'Pull-Up',
            'base_unit'     => 'sq_ft',
            'is_leather'    => true,
            'reorder_level' => 50,
            'is_active'     => true,
        ]);

        $variant = MaterialVariant::create([
            'material_id'   => $leather->id,
            'name'          => 'Tan (1.2mm)',
            'sku'           => 'LTH-TAN',
            'reorder_level' => 50,
            'is_active'     => true,
        ]);

        Inventory::create([
            'material_id'         => $leather->id,
            'material_variant_id' => $variant->id,
            'quantity_on_hand'    => 100,
            'unit'                => 'sq_ft',
        ]);

        $response = $this->actingAs($this->admin)->post(route('leather.variants.restock', $variant->id), [
            'add_quantity' => 150,
            'note'         => 'Received 150 Sq. Ft from tannery',
        ]);

        $response->assertRedirect(route('leather.index'));

        $this->assertDatabaseHas('inventory', [
            'material_variant_id' => $variant->id,
            'quantity_on_hand'    => 250,
        ]);

        $this->assertDatabaseHas('stock_transactions', [
            'material_variant_id' => $variant->id,
            'change_qty'          => 150,
            'balance_after'       => 250,
            'type'                => StockTransaction::TYPE_RESTOCK,
        ]);
    }

    public function test_user_can_download_leather_issue_slip_pdf(): void
    {
        $leather = Material::create([
            'name'          => 'Full Grain Nappa',
            'category'      => 'Nappa',
            'base_unit'     => 'sq_ft',
            'is_leather'    => true,
            'reorder_level' => 30,
            'is_active'     => true,
        ]);

        $variant = MaterialVariant::create([
            'material_id'   => $leather->id,
            'name'          => 'Jet Black',
            'reorder_level' => 30,
            'is_active'     => true,
        ]);

        $product = Product::create([
            'code'        => 'WAL-007',
            'name'        => 'Executive Bifold Wallet',
            'created_by'  => $this->admin->id,
        ]);

        $labour = Labour::create([
            'name'       => 'Master Artisan Ahmed',
            'phone'      => '+91 98765 43210',
            'skill_tags' => ['Master Craftsman', 'Edge Finishing'],
        ]);

        $assignment = Assignment::create([
            'assignment_no' => 'WO-2026-0099',
            'product_id'    => $product->id,
            'labour_id'     => $labour->id,
            'quantity'      => 50,
            'assigned_by'   => $this->admin->id,
            'status'        => 'ASSIGNED',
        ]);

        AssignmentMaterial::create([
            'assignment_id'       => $assignment->id,
            'material_id'         => $leather->id,
            'material_variant_id' => $variant->id,
            'label'               => 'Exterior Body Shell',
            'quantity_used'       => 75.0,
            'unit'                => 'sq_ft',
        ]);

        $response = $this->actingAs($this->admin)->get(route('assignments.leather-pdf', $assignment->id));
        $response->assertOk();
        $this->assertEquals('application/pdf', $response->headers->get('content-type'));
    }
}
