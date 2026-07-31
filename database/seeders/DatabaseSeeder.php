<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Spatie Admin Role
        $adminRole = Role::firstOrCreate(['name' => 'ADMIN']);

        // Default Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@salahinternational.com'],
            [
                'name' => 'CRM Admin',
                'password' => Hash::make('password'),
                'role' => 'ADMIN',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);
    }
}
