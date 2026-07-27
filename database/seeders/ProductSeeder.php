<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $calfskin = Material::where('name', 'Full-Grain Calfskin Leather')->first();
        $cowhide  = Material::where('name', 'Top-Grain Cowhide Leather')->first();
        $waxThread = Material::where('name', 'Waxed Polyester Thread (0.8mm)')->first();
        $glue     = Material::where('name', 'Neoprene Contact Cement Glue')->first();
        $snap     = Material::where('name', 'Brass Snap Fastener 12mm')->first();
        $dring    = Material::where('name', 'Brass D-Ring 25mm')->first();
        $lining   = Material::where('name', 'Suede Microfiber Lining')->first();

        // 1. Bi-Fold Wallet
        $wallet = Product::firstOrCreate(
            ['code' => 'WAL-BF-001'],
            [
                'name' => 'Classic Leather Bi-Fold Wallet',
                'category' => 'Wallet',
                'description' => 'Handcrafted 6-card slot bi-fold wallet made from premium full-grain calfskin leather.',
                'is_active' => true,
            ]
        );

        $wallet->materials()->delete();
        $wallet->materials()->createMany([
            [
                'material_id' => $calfskin?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Exterior & Interior Panels',
                'quantity_min' => 450,
                'quantity_max' => 500,
                'unit' => 'cm2',
                'dimension_note' => '23 × 9.5 cm outer shell + 6 card slots',
                'sort_order' => 1,
            ],
            [
                'material_id' => $waxThread?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Saddle Stitching Thread',
                'quantity_min' => 4,
                'quantity_max' => 6,
                'unit' => 'm',
                'dimension_note' => '3.85mm stitch pitch',
                'sort_order' => 2,
            ],
            [
                'material_id' => $glue?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Edge Basting Cement',
                'quantity_min' => 5,
                'quantity_max' => 8,
                'unit' => 'g',
                'dimension_note' => 'Thin coat on contact areas',
                'sort_order' => 3,
            ],
            [
                'material_type' => 'PROCESS_NOTE',
                'label' => 'Edge Paint & Creasing',
                'dimension_note' => '3 coats matte dark brown edge paint + hot creaser at 160°C',
                'sort_order' => 4,
            ],
        ]);

        // 2. Messenger Bag
        $bag = Product::firstOrCreate(
            ['code' => 'BAG-MS-002'],
            [
                'name' => 'Executive Leather Messenger Bag',
                'category' => 'Bag',
                'description' => 'Full-featured 15-inch laptop messenger bag with adjustable shoulder strap and brass hardware.',
                'is_active' => true,
            ]
        );

        $bag->materials()->delete();
        $bag->materials()->createMany([
            [
                'material_id' => $cowhide?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Main Body & Flap Panels',
                'quantity_min' => 4500,
                'quantity_max' => 5000,
                'unit' => 'cm2',
                'dimension_note' => '40 × 30 × 10 cm gusseted build',
                'sort_order' => 1,
            ],
            [
                'material_id' => $lining?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Inner Microfiber Lining',
                'quantity_min' => 3800,
                'quantity_max' => 4200,
                'unit' => 'cm2',
                'dimension_note' => 'Full interior lining including laptop sleeve',
                'sort_order' => 2,
            ],
            [
                'material_id' => $waxThread?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Heavy Duty Perimeter Thread',
                'quantity_min' => 25,
                'quantity_max' => 30,
                'unit' => 'm',
                'dimension_note' => '0.8mm thick thread',
                'sort_order' => 3,
            ],
            [
                'material_id' => $glue?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Lining Laminating Glue',
                'quantity_min' => 40,
                'quantity_max' => 60,
                'unit' => 'g',
                'sort_order' => 4,
            ],
            [
                'material_id' => $dring?->id,
                'material_type' => 'HARDWARE',
                'label' => 'Strap Mount D-Rings',
                'quantity_min' => 2,
                'quantity_max' => 2,
                'unit' => 'pcs',
                'dimension_note' => 'Solid brass 25mm',
                'sort_order' => 5,
            ],
            [
                'material_type' => 'PROCESS_NOTE',
                'label' => 'Strap Assembly',
                'dimension_note' => 'Double-layer 38mm leather strap with shoulder pad',
                'sort_order' => 6,
            ],
        ]);

        // 3. Card Holder
        $cardHolder = Product::firstOrCreate(
            ['code' => 'CRD-SL-003'],
            [
                'name' => 'Minimalist Slim Card Sleeve',
                'category' => 'Card Holder',
                'description' => 'Ultra-thin 3-pocket leather card sleeve for quick access essentials.',
                'is_active' => true,
            ]
        );

        $cardHolder->materials()->delete();
        $cardHolder->materials()->createMany([
            [
                'material_id' => $calfskin?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Card Pocket Panels',
                'quantity_min' => 180,
                'quantity_max' => 200,
                'unit' => 'cm2',
                'dimension_note' => '10 × 7 cm ultra-slim profile',
                'sort_order' => 1,
            ],
            [
                'material_id' => $waxThread?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Side Seam Thread',
                'quantity_min' => 2,
                'quantity_max' => 3,
                'unit' => 'm',
                'sort_order' => 2,
            ],
            [
                'material_id' => $glue?->id,
                'material_type' => 'CONSUMABLE',
                'label' => 'Assembly Glue',
                'quantity_min' => 3,
                'quantity_max' => 5,
                'unit' => 'g',
                'sort_order' => 3,
            ],
            [
                'material_type' => 'PROCESS_NOTE',
                'label' => 'Edge Polish',
                'dimension_note' => 'Beveled edges polished with Tokonole & beeswax',
                'sort_order' => 4,
            ],
        ]);
    }
}
