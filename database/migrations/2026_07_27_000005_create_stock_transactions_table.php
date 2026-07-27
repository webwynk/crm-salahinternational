<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained();
            $table->decimal('change_qty', 14, 3);
            $table->string('type', 20); // ASSIGNMENT_DEDUCTION | RESTOCK | MANUAL_ADJUSTMENT | ASSIGNMENT_REVERSAL
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('balance_after', 14, 3);
            $table->text('note')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['material_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
    }
};
