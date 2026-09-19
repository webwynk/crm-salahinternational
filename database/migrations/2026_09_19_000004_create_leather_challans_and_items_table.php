<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leather_challans', function (Blueprint $table) {
            $table->id();
            $table->string('challan_no', 50)->unique();
            $table->foreignId('cutter_id')->constrained('cutters')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials')->restrictOnDelete();
            $table->foreignId('material_variant_id')->nullable()->constrained('material_variants')->nullOnDelete();
            $table->decimal('total_sqft', 10, 2);
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('ISSUED'); // ISSUED, CANCELLED
            $table->string('pdf_path', 255)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('leather_challan_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leather_challan_id')->constrained('leather_challans')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->integer('quantity');
            $table->decimal('leather_sqft_per_pc', 10, 2);
            $table->decimal('total_sqft', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leather_challan_items');
        Schema::dropIfExists('leather_challans');
    }
};
