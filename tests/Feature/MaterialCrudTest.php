<?php

namespace Tests\Feature;

use App\Models\Material;
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

        // Verify that custom category is uppercased and saved
        $this->assertDatabaseHas('materials', [
            'name' => 'Heavy Duty Brass Zipper #5',
            'category' => 'ZIPPER',
            'base_unit' => 'm',
        ]);

        // Verify distinct categories in index includes new custom category
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
}
