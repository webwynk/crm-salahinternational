<?php

namespace Database\Seeders;

use App\Models\Labour;
use Illuminate\Database\Seeder;

class LabourSeeder extends Seeder
{
    public function run(): void
    {
        $workers = [
            [
                'name' => 'Ramesh Kumar',
                'phone' => '+91 98765 43210',
                'address' => 'Shop #14, Leather Complex, Kanpur, UP',
                'skill_tags' => ['Saddle Stitching', 'Edge Paint', 'Wallet Assembly'],
                'is_active' => true,
            ],
            [
                'name' => 'Suresh Verma',
                'phone' => '+91 98123 45678',
                'address' => 'Plot 42, Industrial Area Phase 2, Noida, UP',
                'skill_tags' => ['Pattern Cutting', 'Skiving', 'Bag Construction'],
                'is_active' => true,
            ],
            [
                'name' => 'Anita Sharma',
                'phone' => '+91 97654 32109',
                'address' => 'Sector 7, Crafts Village, Dharavi, Mumbai, MH',
                'skill_tags' => ['Hardware Fitting', 'Finishing & Burnishing', 'Quality Check'],
                'is_active' => true,
            ],
        ];

        foreach ($workers as $data) {
            Labour::firstOrCreate(['phone' => $data['phone']], $data);
        }
    }
}
