<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('materials')
            ->where('is_leather', false)
            ->update([
                'name' => DB::raw('UPPER(name)'),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Uppercase normalization is permanent
    }
};
