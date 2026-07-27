<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLockoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'testuser@example.com',
            'password' => bcrypt('password123'),
            'role' => 'STAFF',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'testuser@example.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/dashboard');
    }

    public function test_account_locks_after_5_failed_login_attempts(): void
    {
        $user = User::factory()->create([
            'email' => 'staff@example.com',
            'password' => bcrypt('correctpassword'),
            'role' => 'STAFF',
            'is_active' => true,
            'failed_login_attempts' => 0,
        ]);

        for ($i = 1; $i <= 5; $i++) {
            $this->post('/login', [
                'email' => 'staff@example.com',
                'password' => 'wrongpassword',
            ]);
        }

        $user->refresh();
        $this->assertEquals(5, $user->failed_login_attempts);
        $this->assertNotNull($user->locked_until);

        // 6th attempt should be blocked with lockout message
        $response = $this->post('/login', [
            'email' => 'staff@example.com',
            'password' => 'correctpassword',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@example.com',
            'password' => bcrypt('password123'),
            'role' => 'STAFF',
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'inactive@example.com',
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email']);
    }

    public function test_staff_user_cannot_access_admin_restock_route(): void
    {
        $staff = User::factory()->create([
            'role' => 'STAFF',
            'is_active' => true,
        ]);

        $this->actingAs($staff);

        $response = $this->post('/materials', [
            'name' => 'New Leather',
            'category' => 'LEATHER',
            'base_unit' => 'cm2',
            'reorder_level' => 100,
            'initial_stock' => 500,
        ]);

        $response->assertStatus(403);
    }
}
