<?php

namespace Tests\Feature;

use App\Models\Labour;
use App\Models\Material;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SystemCleanDbTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_clean_manufacturing_database_via_web_route(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'ADMIN']);
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $admin->assignRole($adminRole);

        // Create some manufacturing data
        $material = Material::create([
            'name' => 'Test Leather',
            'base_unit' => 'SQFT',
            'category' => 'LEATHER',
        ]);
        $product = Product::create([
            'name' => 'Test Wallet',
            'code' => 'PRD-TEST',
            'category' => 'WALLETS',
        ]);
        $labour = Labour::create([
            'name' => 'Test Artisan',
            'phone' => '1234567890',
        ]);

        $this->assertDatabaseCount('materials', 1);
        $this->assertDatabaseCount('products', 1);
        $this->assertDatabaseCount('labour', 1);

        // Execute clean-db route as Admin
        $response = $this->actingAs($admin)->get(route('system.clean-db'));

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
        ]);

        // Manufacturing tables should be empty
        $this->assertDatabaseCount('materials', 0);
        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('labour', 0);

        // Admin user must still exist
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}
