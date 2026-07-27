<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->string('assignment_no', 30)->unique();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('labour_id')->constrained('labour');
            $table->unsignedInteger('quantity');
            $table->string('status', 20)->default('ASSIGNED'); // ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
            $table->foreignId('assigned_by')->constrained('users');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('labour_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
