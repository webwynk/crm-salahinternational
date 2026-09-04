<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $admin = User::where('email', 'admin@salahinternational.com')->first();
        if ($admin) {
            $admin->update([
                'password' => Hash::make('133223@CrM'),
                'failed_login_attempts' => 0,
                'locked_until' => null,
                'is_active' => true,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
