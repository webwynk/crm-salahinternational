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
}
