<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create product_colors table
        Schema::create('product_colors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('color_name', 60);
            $table->string('image_url', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'is_active']);
        });

        // 2. Add has_colors flag to products table
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('has_colors')->default(false)->after('image_url');
        });

        // 3. Add product_color_id to product_materials (BOM)
        Schema::table('product_materials', function (Blueprint $table) {
            $table->foreignId('product_color_id')->nullable()->after('product_id')->constrained('product_colors')->cascadeOnDelete();
            $table->index(['product_id', 'product_color_id']);
        });

        // 4. Add product_color_id to assignments table
        Schema::table('assignments', function (Blueprint $table) {
            $table->foreignId('product_color_id')->nullable()->after('product_id')->constrained('product_colors')->nullOnDelete();
            $table->index(['product_id', 'product_color_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Drop product_color_id from assignments
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['product_color_id']);
            $table->dropIndex(['product_id', 'product_color_id']);
            $table->dropColumn('product_color_id');
        });

        // 2. Drop product_color_id from product_materials
        Schema::table('product_materials', function (Blueprint $table) {
            $table->dropForeign(['product_color_id']);
            $table->dropIndex(['product_id', 'product_color_id']);
            $table->dropColumn('product_color_id');
        });

        // 3. Drop has_colors from products
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('has_colors');
        });

        // 4. Drop product_colors table
        Schema::dropIfExists('product_colors');
    }
};
