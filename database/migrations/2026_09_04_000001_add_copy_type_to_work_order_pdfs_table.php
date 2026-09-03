<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_pdfs', function (Blueprint $table) {
            $table->string('copy_type', 30)->default('FABRICATOR')->after('assignment_id');
            $table->index(['assignment_id', 'copy_type']);
        });
    }

    public function down(): void
    {
        Schema::table('work_order_pdfs', function (Blueprint $table) {
            $table->dropIndex(['assignment_id', 'copy_type']);
            $table->dropColumn('copy_type');
        });
    }
};
