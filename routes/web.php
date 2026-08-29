<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LabourController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Products & BOM Management
    Route::resource('products', ProductController::class);

    // Materials Master & Inventory
    Route::get('/materials', [MaterialController::class, 'index'])->name('materials.index');
    Route::middleware('role:ADMIN')->group(function () {
        Route::post('/materials', [MaterialController::class, 'store'])->name('materials.store');
        Route::put('/materials/{material}', [MaterialController::class, 'update'])->name('materials.update');
        Route::post('/materials/{material}/restock', [MaterialController::class, 'restock'])->name('materials.restock');
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy'])->name('materials.destroy');
    });

    // Labour Artisans
    Route::resource('labour', LabourController::class)->except(['create', 'edit', 'destroy']);

    // Assignments & Work Orders
    Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::get('/assignments/create', [AssignmentController::class, 'create'])->name('assignments.create');
    Route::post('/assignments/pre-check', [AssignmentController::class, 'preCheck'])->name('assignments.pre-check');
    Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::patch('/assignments/{assignment}/status', [AssignmentController::class, 'updateStatus'])->name('assignments.status');
    Route::get('/assignments/{assignment}/pdf', [AssignmentController::class, 'downloadPdf'])->name('assignments.pdf');

    // User Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // System Database Migration Web Route (Admin Only)
    Route::middleware('role:ADMIN')->get('/system/migrate-db', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            $output = \Illuminate\Support\Facades\Artisan::output();

            return response()->json([
                'status' => 'success',
                'message' => 'Database migration completed successfully!',
                'output' => trim($output) ?: 'Database is up to date.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Migration failed: ' . $e->getMessage(),
            ], 500);
        }
    })->name('system.migrate');
});

require __DIR__.'/auth.php';
