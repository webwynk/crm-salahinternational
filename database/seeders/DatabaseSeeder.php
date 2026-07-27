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
        // Create Spatie Roles
        $adminRole = Role::firstOrCreate(['name' => 'ADMIN']);
        $staffRole = Role::firstOrCreate(['name' => 'STAFF']);

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

        // Default Staff User
        $staff = User::firstOrCreate(
            ['email' => 'staff@salahinternational.com'],
            [
                'name' => 'CRM Staff',
                'password' => Hash::make('password'),
                'role' => 'STAFF',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $staff->assignRole($staffRole);

        $this->call([
            MaterialSeeder::class,
            ProductSeeder::class,
            LabourSeeder::class,
        ]);
    }
}
