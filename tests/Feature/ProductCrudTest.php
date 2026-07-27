<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Material $material;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'ADMIN']);
        $this->material = Material::create([
            'name' => 'Full Grain Leather',
            'category' => 'LEATHER',
            'base_unit' => 'cm2',
            'reorder_level' => 100,
        ]);
    }

    public function test_authenticated_user_can_create_product_with_bom(): void
    {
        $this->actingAs($this->user);

        $response = $this->post('/products', [
            'code' => 'BAG-MB-001',
            'name' => 'Messenger Leather Bag',
            'category' => 'Bag',
            'description' => 'Premium handcrafted messenger bag',
            'materials' => [
                [
                    'material_id' => $this->material->id,
                    'material_type' => 'CONSUMABLE',
                    'label' => 'Main Body Hides',
                    'quantity_min' => 120,
                    'quantity_max' => 150,
                    'unit' => 'cm2',
                    'dimension_note' => '40 x 30 cm front panel',
                ],
                [
                    'material_id' => null,
                    'material_type' => 'PROCESS_NOTE',
                    'label' => 'Double Edge Painting',
                    'quantity_min' => null,
                    'quantity_max' => null,
                    'unit' => null,
                    'dimension_note' => 'Apply 3 coats of dark brown edge paint',
                ],
            ],
        ]);

        $response->assertRedirect('/products');
        $this->assertDatabaseHas('products', [
            'code' => 'BAG-MB-001',
            'name' => 'Messenger Leather Bag',
        ]);

        $product = Product::where('code', 'BAG-MB-001')->first();
        $this->assertCount(2, $product->materials);
    }

    public function test_duplicate_product_code_validation_fails(): void
    {
        $this->actingAs($this->user);

        Product::create([
            'code' => 'WAL-BF-001',
            'name' => 'Bi-Fold Wallet',
            'created_by' => $this->user->id,
        ]);

        $response = $this->post('/products', [
            'code' => 'WAL-BF-001',
            'name' => 'Duplicate Code Product',
            'materials' => [
                [
                    'material_type' => 'CONSUMABLE',
                    'label' => 'Test Panel',
                ],
            ],
        ]);

        $response->assertSessionHasErrors(['code']);
    }
}
