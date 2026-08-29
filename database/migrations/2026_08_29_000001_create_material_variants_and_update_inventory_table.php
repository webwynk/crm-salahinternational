<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create material_variants table
        Schema::create('material_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('sku', 50)->nullable();
            $table->decimal('reorder_level', 12, 3)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['material_id', 'is_active']);
        });

        // 2. Add material_variant_id to stock_transactions
        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->foreignId('material_variant_id')->nullable()->after('material_id')->constrained('material_variants')->nullOnDelete();
        });

        // 3. Add material_variant_id to product_materials (BOM)
        Schema::table('product_materials', function (Blueprint $table) {
            $table->foreignId('material_variant_id')->nullable()->after('material_id')->constrained('material_variants')->nullOnDelete();
        });

        // 4. Add material_variant_id to assignment_materials
        Schema::table('assignment_materials', function (Blueprint $table) {
            $table->foreignId('material_variant_id')->nullable()->after('material_id')->constrained('material_variants')->nullOnDelete();
        });

        // 5. Back up existing inventory records before modifying structure
        $existingInventory = DB::table('inventory')->get();

        // Drop old single-stock inventory table and recreate with auto-increment ID & variant support
        Schema::dropIfExists('inventory');

        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->foreignId('material_variant_id')->nullable()->constrained('material_variants')->cascadeOnDelete();
            $table->decimal('quantity_on_hand', 14, 3)->default(0);
            $table->string('unit', 10);
            $table->timestamps();

            $table->index(['material_id', 'material_variant_id']);
        });

        // 6. Data Migration: Create default 'Standard' variant for all existing materials
        $materials = DB::table('materials')->get();
        foreach ($materials as $material) {
            $variantId = DB::table('material_variants')->insertGetId([
                'material_id'   => $material->id,
                'name'          => 'Standard',
                'sku'           => null,
                'reorder_level' => $material->reorder_level ?? 0,
                'is_active'     => $material->is_active ?? true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            // Restore previous inventory record with the new variant link
            $oldInv = $existingInventory->firstWhere('material_id', $material->id);
            $qty = $oldInv ? $oldInv->quantity_on_hand : 0;
            $unit = $oldInv ? $oldInv->unit : ($material->base_unit ?? 'pcs');

            DB::table('inventory')->insert([
                'material_id'         => $material->id,
                'material_variant_id' => $variantId,
                'quantity_on_hand'    => $qty,
                'unit'                => $unit,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            // Link existing stock transactions to this variant
            DB::table('stock_transactions')
                ->where('material_id', $material->id)
                ->whereNull('material_variant_id')
                ->update(['material_variant_id' => $variantId]);

            // Link existing BOM product materials to this variant
            DB::table('product_materials')
                ->where('material_id', $material->id)
                ->whereNull('material_variant_id')
                ->update(['material_variant_id' => $variantId]);

            // Link existing assignment materials to this variant
            DB::table('assignment_materials')
                ->where('material_id', $material->id)
                ->whereNull('material_variant_id')
                ->update(['material_variant_id' => $variantId]);
        }
    }

    public function down(): void
    {
        $existingInventory = DB::table('inventory')->get();

        Schema::dropIfExists('inventory');

        Schema::create('inventory', function (Blueprint $table) {
            $table->foreignId('material_id')->primary()->constrained()->cascadeOnDelete();
            $table->decimal('quantity_on_hand', 14, 3)->default(0);
            $table->string('unit', 10);
            $table->timestamps();
        });

        foreach ($existingInventory as $inv) {
            DB::table('inventory')->updateOrInsert(
                ['material_id' => $inv->material_id],
                [
                    'quantity_on_hand' => $inv->quantity_on_hand,
                    'unit' => $inv->unit,
                    'created_at' => $inv->created_at,
                    'updated_at' => $inv->updated_at,
                ]
            );
        }

        Schema::table('assignment_materials', function (Blueprint $table) {
            $table->dropForeign(['material_variant_id']);
            $table->dropColumn('material_variant_id');
        });

        Schema::table('product_materials', function (Blueprint $table) {
            $table->dropForeign(['material_variant_id']);
            $table->dropColumn('material_variant_id');
        });

        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->dropForeign(['material_variant_id']);
            $table->dropColumn('material_variant_id');
        });

        Schema::dropIfExists('material_variants');
    }
};
