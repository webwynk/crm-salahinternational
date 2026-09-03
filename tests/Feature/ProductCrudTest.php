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

    public function test_authenticated_user_can_create_product_with_streamlined_bom(): void
    {
        $this->actingAs($this->user);

        $response = $this->post('/products', [
            'code' => 'WAL-SLIM-01',
            'name' => 'Slim Cardholder',
            'category' => 'Wallet',
            'materials' => [
                [
                    'material_id' => $this->material->id,
                    'label' => $this->material->name,
                    'quantity_min' => 0.5,
                    'unit' => 'cm2',
                ],
            ],
        ]);

        $response->assertRedirect('/products');
        $this->assertDatabaseHas('products', [
            'code' => 'WAL-SLIM-01',
            'name' => 'Slim Cardholder',
        ]);

        $product = Product::where('code', 'WAL-SLIM-01')->first();
        $this->assertCount(1, $product->materials);

        $bomItem = $product->materials->first();
        $this->assertEquals('CONSUMABLE', $bomItem->material_type);
        $this->assertEquals(0.5, (float) $bomItem->quantity_min);
        $this->assertEquals($this->material->name, $bomItem->label);
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

    public function test_product_with_assignments_cannot_be_deleted(): void
    {
        $this->actingAs($this->user);

        $product = Product::create([
            'code' => 'WAL-BF-002',
            'name' => 'Bifold Wallet Deluxe',
            'created_by' => $this->user->id,
        ]);

        $labour = \App\Models\Labour::create([
            'name' => 'Artisan Test',
            'phone' => '1234567890',
            'is_active' => true,
        ]);

        \App\Models\Assignment::create([
            'assignment_no' => 'WO-2026-9999',
            'product_id' => $product->id,
            'labour_id' => $labour->id,
            'quantity' => 10,
            'assigned_by' => $this->user->id,
            'status' => 'ASSIGNED',
        ]);

        $response = $this->delete("/products/{$product->id}");

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_authenticated_user_can_update_product_via_put(): void
    {
        $this->actingAs($this->user);

        $product = Product::create([
            'code' => 'WAL-BF-UPDATE-1',
            'name' => 'Original Name',
            'created_by' => $this->user->id,
        ]);

        $response = $this->put("/products/{$product->id}", [
            'code' => 'WAL-BF-UPDATE-1',
            'name' => 'Updated Name via PUT',
            'category' => 'Wallet',
            'materials' => [
                [
                    'material_id' => $this->material->id,
                    'material_type' => 'CONSUMABLE',
                    'label' => 'Updated Shell',
                    'quantity_min' => 2.0,
                    'unit' => 'cm2',
                ],
            ],
        ]);

        $response->assertRedirect('/products');
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name via PUT',
        ]);
    }

    public function test_authenticated_user_can_update_product_via_post(): void
    {
        $this->actingAs($this->user);

        $product = Product::create([
            'code' => 'WAL-BF-UPDATE-2',
            'name' => 'Original Name',
            'created_by' => $this->user->id,
        ]);

        $response = $this->post("/products/{$product->id}", [
            '_method' => 'PUT',
            'code' => 'WAL-BF-UPDATE-2',
            'name' => 'Updated Name via POST',
            'category' => 'Wallet',
            'materials' => [
                [
                    'material_id' => $this->material->id,
                    'material_type' => 'CONSUMABLE',
                    'label' => 'Updated Shell',
                    'quantity_min' => 1.5,
                    'unit' => 'cm2',
                ],
            ],
        ]);

        $response->assertRedirect('/products');
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name via POST',
        ]);
    }

    public function test_product_without_assignments_can_be_deleted(): void
    {
        $this->actingAs($this->user);

        $product = Product::create([
            'code' => 'WAL-BF-003',
            'name' => 'Bifold Wallet Simple',
            'created_by' => $this->user->id,
        ]);

        $response = $this->delete("/products/{$product->id}");

        $response->assertRedirect('/products');
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
