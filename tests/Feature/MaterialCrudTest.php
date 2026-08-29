<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\MaterialVariant;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaterialCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'ADMIN']);
    }

    public function test_admin_can_create_material_with_standard_units(): void
    {
        $this->actingAs($this->admin);

        $units = ['pcs', 'm', 'cm', 'in', 'yard', 'feet', 'sq m'];

        foreach ($units as $unit) {
            $response = $this->post('/materials', [
                'name' => "Material in {$unit}",
                'category' => 'LEATHER',
                'base_unit' => $unit,
                'reorder_level' => 10,
                'initial_stock' => 50.5,
            ]);

            $response->assertRedirect('/materials');
            $this->assertDatabaseHas('materials', [
                'name' => "Material in {$unit}",
                'base_unit' => $unit,
            ]);

            $material = Material::where('name', "Material in {$unit}")->first();
            $this->assertDatabaseHas('inventory', [
                'material_id' => $material->id,
                'quantity_on_hand' => 50.5,
                'unit' => $unit,
            ]);
        }
    }

    public function test_admin_can_create_material_with_multiple_variations(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/materials', [
            'name' => 'Full-Grain Calfskin Leather',
            'category' => 'LEATHER',
            'base_unit' => 'sq m',
            'variants' => [
                [
                    'name' => 'Tan / Cognac',
                    'sku' => 'LEA-TAN',
                    'reorder_level' => 100,
                    'initial_stock' => 500,
                ],
                [
                    'name' => 'Midnight Black',
                    'sku' => 'LEA-BLK',
                    'reorder_level' => 80,
                    'initial_stock' => 350,
                ],
            ],
        ]);

        $response->assertRedirect('/materials');

        $material = Material::where('name', 'Full-Grain Calfskin Leather')->firstOrFail();
        $this->assertCount(2, $material->variants);

        $this->assertDatabaseHas('material_variants', [
            'material_id' => $material->id,
            'name' => 'Tan / Cognac',
            'sku' => 'LEA-TAN',
        ]);

        $this->assertDatabaseHas('material_variants', [
            'material_id' => $material->id,
            'name' => 'Midnight Black',
            'sku' => 'LEA-BLK',
        ]);
    }

    public function test_admin_can_add_variation_to_existing_material(): void
    {
        $this->actingAs($this->admin);

        $material = Material::create([
            'name' => 'Polyester Thread',
            'category' => 'THREAD',
            'base_unit' => 'm',
            'reorder_level' => 50,
        ]);

        $response = $this->post("/materials/{$material->id}/variants", [
            'name' => '0.8mm Brown',
            'sku' => 'THR-BRN-08',
            'reorder_level' => 20,
            'initial_stock' => 100,
        ]);

        $response->assertRedirect('/materials');

        $this->assertDatabaseHas('material_variants', [
            'material_id' => $material->id,
            'name' => '0.8mm Brown',
        ]);

        $variant = MaterialVariant::where('name', '0.8mm Brown')->firstOrFail();
        $this->assertDatabaseHas('inventory', [
            'material_variant_id' => $variant->id,
            'quantity_on_hand' => 100,
        ]);
    }

    public function test_admin_can_restock_specific_variant(): void
    {
        $this->actingAs($this->admin);

        $material = Material::create([
            'name' => 'Metal Zipper #5',
            'category' => 'HARDWARE',
            'base_unit' => 'pcs',
            'reorder_level' => 100,
        ]);

        $variant = $material->variants()->create([
            'name' => '20cm Antique Brass',
            'reorder_level' => 50,
            'is_active' => true,
        ]);

        $variant->inventory()->create([
            'material_id' => $material->id,
            'quantity_on_hand' => 200,
            'unit' => 'pcs',
        ]);

        $response = $this->post("/materials/variants/{$variant->id}/restock", [
            'add_quantity' => 150,
            'note' => 'Supplier Batch #42',
        ]);

        $response->assertRedirect('/materials');

        $this->assertDatabaseHas('inventory', [
            'material_variant_id' => $variant->id,
            'quantity_on_hand' => 350,
        ]);

        $this->assertDatabaseHas('stock_transactions', [
            'material_variant_id' => $variant->id,
            'change_qty' => 150,
            'balance_after' => 350,
            'type' => 'RESTOCK',
        ]);
    }

    public function test_invalid_unit_validation_fails(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/materials', [
            'name' => 'Invalid Unit Material',
            'category' => 'LEATHER',
            'base_unit' => 'invalid_unit_123',
            'reorder_level' => 10,
            'initial_stock' => 50,
        ]);

        $response->assertSessionHasErrors(['base_unit']);
    }

    public function test_admin_can_restock_material(): void
    {
        $this->actingAs($this->admin);

        $material = Material::create([
            'name' => 'Lining Fabric',
            'category' => 'LINING',
            'base_unit' => 'yard',
            'reorder_level' => 20,
        ]);

        $material->inventory()->create([
            'quantity_on_hand' => 50,
            'unit' => 'yard',
        ]);

        $response = $this->post("/materials/{$material->id}/restock", [
            'add_quantity' => 25.5,
            'note' => 'Restock Roll #99',
        ]);

        $response->assertRedirect('/materials');

        $this->assertDatabaseHas('inventory', [
            'material_id' => $material->id,
            'quantity_on_hand' => 75.5,
            'unit' => 'yard',
        ]);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $material->id,
            'change_qty' => 25.5,
            'balance_after' => 75.5,
            'type' => 'RESTOCK',
        ]);
    }

    public function test_admin_can_create_material_with_custom_category(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/materials', [
            'name' => 'Heavy Duty Brass Zipper #5',
            'category' => 'zipper',
            'base_unit' => 'm',
            'reorder_level' => 15,
            'initial_stock' => 100,
        ]);

        $response->assertRedirect('/materials');

        $this->assertDatabaseHas('materials', [
            'name' => 'Heavy Duty Brass Zipper #5',
            'category' => 'ZIPPER',
            'base_unit' => 'm',
        ]);

        $indexResponse = $this->get('/materials');
        $indexResponse->assertOk();
        $categories = $indexResponse->inertiaProps('categories');
        $this->assertTrue(collect($categories)->contains('ZIPPER'));
    }

    public function test_category_length_exceeding_40_chars_fails_validation(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post('/materials', [
            'name' => 'Overly Long Category Material',
            'category' => str_repeat('A', 41),
            'base_unit' => 'pcs',
            'reorder_level' => 5,
            'initial_stock' => 10,
        ]);

        $response->assertSessionHasErrors(['category']);
    }

    public function test_admin_can_delete_unused_material_from_database(): void
    {
        $this->actingAs($this->admin);

        $material = Material::create([
            'name' => 'Obsolete Rivets',
            'category' => 'HARDWARE',
            'base_unit' => 'pcs',
            'reorder_level' => 10,
        ]);

        $material->inventory()->create([
            'quantity_on_hand' => 100,
            'unit' => 'pcs',
        ]);

        $response = $this->delete("/materials/{$material->id}");

        $response->assertRedirect('/materials');
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('materials', ['id' => $material->id]);
        $this->assertDatabaseMissing('inventory', ['material_id' => $material->id]);
    }

    public function test_material_used_in_product_bom_cannot_be_deleted(): void
    {
        $this->actingAs($this->admin);

        $material = Material::create([
            'name' => 'Active Shell Leather',
            'category' => 'LEATHER',
            'base_unit' => 'sq m',
            'reorder_level' => 5,
        ]);

        $material->inventory()->create([
            'quantity_on_hand' => 20,
            'unit' => 'sq m',
        ]);

        $product = Product::create([
            'code' => 'BAG-TEST-001',
            'name' => 'Leather Briefcase',
            'created_by' => $this->admin->id,
        ]);

        $product->materials()->create([
            'material_id' => $material->id,
            'material_type' => 'CONSUMABLE',
            'label' => 'Main Body Hides',
            'quantity_min' => 1.5,
            'quantity_max' => 1.8,
            'unit' => 'sq m',
        ]);

        $response = $this->delete("/materials/{$material->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('materials', ['id' => $material->id]);
    }

    public function test_non_admin_cannot_delete_material(): void
    {
        $staff = User::factory()->create(['role' => 'STAFF']);
        $this->actingAs($staff);

        $material = Material::create([
            'name' => 'Protected Thread',
            'category' => 'THREAD',
            'base_unit' => 'm',
            'reorder_level' => 10,
        ]);

        $response = $this->delete("/materials/{$material->id}");
        $response->assertForbidden();

        $this->assertDatabaseHas('materials', ['id' => $material->id]);
    }
}
