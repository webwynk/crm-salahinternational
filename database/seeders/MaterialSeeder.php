<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Material;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $materials = [
            [
                'name' => 'Full-Grain Calfskin Leather',
                'category' => 'LEATHER',
                'base_unit' => 'cm2',
                'reorder_level' => 5000,
                'stock' => 50000,
            ],
            [
                'name' => 'Top-Grain Cowhide Leather',
                'category' => 'LEATHER',
                'base_unit' => 'cm2',
                'reorder_level' => 8000,
                'stock' => 75000,
            ],
            [
                'name' => 'Waxed Polyester Thread (0.8mm)',
                'category' => 'THREAD',
                'base_unit' => 'm',
                'reorder_level' => 100,
                'stock' => 1500,
            ],
            [
                'name' => 'Nylon Thread (0.6mm)',
                'category' => 'THREAD',
                'base_unit' => 'm',
                'reorder_level' => 150,
                'stock' => 2000,
            ],
            [
                'name' => 'Neoprene Contact Cement Glue',
                'category' => 'GLUE',
                'base_unit' => 'g',
                'reorder_level' => 200,
                'stock' => 2500,
            ],
            [
                'name' => 'Brass Snap Fastener 12mm',
                'category' => 'HARDWARE',
                'base_unit' => 'pcs',
                'reorder_level' => 50,
                'stock' => 500,
            ],
            [
                'name' => 'Brass D-Ring 25mm',
                'category' => 'HARDWARE',
                'base_unit' => 'pcs',
                'reorder_level' => 30,
                'stock' => 300,
            ],
            [
                'name' => 'Suede Microfiber Lining',
                'category' => 'LINING',
                'base_unit' => 'cm2',
                'reorder_level' => 3000,
                'stock' => 30000,
            ],
        ];

        foreach ($materials as $data) {
            $stock = $data['stock'];
            unset($data['stock']);

            $mat = Material::firstOrCreate(['name' => $data['name']], $data);

            Inventory::updateOrCreate(
                ['material_id' => $mat->id],
                [
                    'quantity_on_hand' => $stock,
                    'unit' => $mat->base_unit,
                ]
            );
        }
    }
}
