<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignment_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->nullable()->constrained();
            $table->string('label', 150);
            $table->decimal('quantity_used', 12, 3)->nullable();
            $table->string('unit', 10)->nullable();
            $table->timestamps();
        });

        Schema::create('work_order_pdfs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->string('file_path'); // relative path in storage/app/public
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_order_pdfs');
        Schema::dropIfExists('assignment_materials');
    }
};
