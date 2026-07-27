<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('material_type', 20)->default('CONSUMABLE'); // CONSUMABLE | HARDWARE | PROCESS_NOTE
            $table->string('label', 150);
            $table->decimal('quantity_min', 10, 3)->nullable();
            $table->decimal('quantity_max', 10, 3)->nullable();
            $table->string('unit', 10)->nullable();
            $table->string('dimension_note', 100)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_materials');
    }
};
