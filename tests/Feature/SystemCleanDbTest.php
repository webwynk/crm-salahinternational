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

    public function test_staff_cannot_access_clean_assignments_route(): void
    {
        $staffRole = Role::firstOrCreate(['name' => 'STAFF']);
        $staff = User::factory()->create(['role' => 'STAFF']);
        $staff->assignRole($staffRole);

        $response = $this->actingAs($staff)->get(route('system.clean-assignments'));
        $response->assertStatus(403);
    }

    public function test_admin_can_clean_work_order_assignments_while_preserving_catalog(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'ADMIN']);
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $admin->assignRole($adminRole);

        // Create catalog data
        $material = Material::create([
            'name' => 'Top Grain Leather',
            'base_unit' => 'SQFT',
            'category' => 'LEATHER',
        ]);
        $inv = \App\Models\Inventory::create([
            'material_id' => $material->id,
            'quantity_on_hand' => 10.0,
            'unit' => 'SQFT',
        ]);
        $product = Product::create([
            'name' => 'Card Holder',
            'code' => 'CRD-01',
            'category' => 'CARD_HOLDERS',
        ]);
        $labour = Labour::create([
            'name' => 'Artisan Ahmed',
            'phone' => '9876543210',
        ]);

        // Create assignment data
        $assignment = \App\Models\Assignment::create([
            'assignment_no' => 'WO-TEST-001',
            'product_id' => $product->id,
            'labour_id' => $labour->id,
            'assigned_by' => $admin->id,
            'quantity' => 5,
            'status' => 'ASSIGNED',
        ]);

        \App\Models\AssignmentMaterial::create([
            'assignment_id' => $assignment->id,
            'material_id' => $material->id,
            'label' => 'Outer Leather',
            'quantity_used' => 2.5,
            'unit' => 'SQFT',
        ]);

        \App\Models\WorkOrderPdf::create([
            'assignment_id' => $assignment->id,
            'copy_type' => 'OFFICE',
            'file_path' => 'work_orders/test.pdf',
            'generated_by' => $admin->id,
        ]);

        $this->assertDatabaseCount('assignments', 1);
        $this->assertDatabaseCount('assignment_materials', 1);
        $this->assertDatabaseCount('work_order_pdfs', 1);

        // Execute clean-assignments route as Admin
        $response = $this->actingAs($admin)->get(route('system.clean-assignments'));

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'details' => [
                'assignments_deleted' => 1,
                'materials_cleared'   => 1,
                'pdfs_cleared'        => 1,
                'stock_refunded'      => true,
            ],
        ]);

        // Assignments and PDFs must be zero
        $this->assertDatabaseCount('assignments', 0);
        $this->assertDatabaseCount('assignment_materials', 0);
        $this->assertDatabaseCount('work_order_pdfs', 0);

        // Catalog, labour, and inventory must remain INTACT
        $this->assertDatabaseCount('materials', 1);
        $this->assertDatabaseCount('products', 1);
        $this->assertDatabaseCount('labour', 1);
        $this->assertDatabaseCount('inventory', 1);

        // Stock must have been refunded (10.0 + 2.5 = 12.5)
        $this->assertEquals(12.5, (float) $inv->fresh()->quantity_on_hand);
    }

    public function test_artisan_command_assignments_wipe_works(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $product = Product::create([
            'name' => 'Bifold Wallet',
            'code' => 'BIF-01',
            'category' => 'WALLETS',
        ]);
        $labour = Labour::create([
            'name' => 'Artisan Tariq',
            'phone' => '1122334455',
        ]);

        \App\Models\Assignment::create([
            'assignment_no' => 'WO-TEST-002',
            'product_id' => $product->id,
            'labour_id' => $labour->id,
            'assigned_by' => $admin->id,
            'quantity' => 2,
            'status' => 'ASSIGNED',
        ]);

        $this->assertDatabaseCount('assignments', 1);

        \Illuminate\Support\Facades\Artisan::call('assignments:wipe');

        $this->assertDatabaseCount('assignments', 0);
        $this->assertDatabaseCount('products', 1);
        $this->assertDatabaseCount('labour', 1);
    }
}

