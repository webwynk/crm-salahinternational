<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LabourController;
use App\Http\Controllers\LeatherController;
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
    Route::match(['put', 'patch', 'post'], '/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::resource('products', ProductController::class)->except(['update']);

    // Dedicated Leather Stock & Hides Management (Sq. Ft)
    Route::get('/leather', [LeatherController::class, 'index'])->name('leather.index');
    Route::middleware('role:ADMIN')->group(function () {
        Route::post('/leather', [LeatherController::class, 'store'])->name('leather.store');
        Route::match(['put', 'patch', 'post'], '/leather/{material}', [LeatherController::class, 'update'])->name('leather.update');
        Route::post('/leather/{material}/restock', [LeatherController::class, 'restock'])->name('leather.restock');
        Route::delete('/leather/{material}', [LeatherController::class, 'destroy'])->name('leather.destroy');
        Route::post('/leather/{material}/variants', [LeatherController::class, 'storeVariant'])->name('leather.variants.store');
        Route::post('/leather/variants/{variant}/restock', [LeatherController::class, 'restockVariant'])->name('leather.variants.restock');
        Route::delete('/leather/variants/{variant}', [LeatherController::class, 'destroyVariant'])->name('leather.variants.destroy');
    });

    // Materials Master & Inventory (Hardware, Zips, Threads)
    Route::get('/materials', [MaterialController::class, 'index'])->name('materials.index');
    Route::middleware('role:ADMIN')->group(function () {
        Route::post('/materials', [MaterialController::class, 'store'])->name('materials.store');
        Route::match(['put', 'patch', 'post'], '/materials/{material}', [MaterialController::class, 'update'])->name('materials.update');
        Route::post('/materials/{material}/restock', [MaterialController::class, 'restock'])->name('materials.restock');
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy'])->name('materials.destroy');
        Route::post('/materials/{material}/variants', [MaterialController::class, 'storeVariant'])->name('materials.variants.store');
        Route::post('/materials/variants/{variant}/restock', [MaterialController::class, 'restockVariant'])->name('materials.variants.restock');
        Route::delete('/materials/variants/{variant}', [MaterialController::class, 'destroyVariant'])->name('materials.variants.destroy');
    });

    // Labour Artisans
    Route::match(['put', 'patch', 'post'], '/labour/{labour}', [LabourController::class, 'update'])->name('labour.update');
    Route::resource('labour', LabourController::class)->except(['create', 'edit', 'destroy', 'update']);

    // Assignments & Work Orders
    Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::get('/assignments/create', [AssignmentController::class, 'create'])->name('assignments.create');
    Route::match(['get', 'post'], '/assignments/pre-check', [AssignmentController::class, 'preCheck'])->name('assignments.pre-check');
    Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::match(['patch', 'put', 'post'], '/assignments/{assignment}/status', [AssignmentController::class, 'updateStatus'])->name('assignments.status');
    Route::get('/assignments/{assignment}/pdf', [AssignmentController::class, 'downloadPdf'])->name('assignments.pdf');
    Route::get('/assignments/{assignment}/leather-pdf', [AssignmentController::class, 'downloadLeatherPdf'])->name('assignments.leather-pdf');

    // User Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['patch', 'put', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
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

    // System Database Clean Web Route (Admin Only) - Wipes products, materials, variants, inventory, assignments, labours
    Route::middleware('role:ADMIN')->get('/system/clean-db', function () {
        try {
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            
            \Illuminate\Support\Facades\DB::table('assignment_materials')->delete();
            \Illuminate\Support\Facades\DB::table('assignments')->delete();
            \Illuminate\Support\Facades\DB::table('stock_transactions')->delete();
            \Illuminate\Support\Facades\DB::table('product_materials')->delete();
            \Illuminate\Support\Facades\DB::table('products')->delete();
            \Illuminate\Support\Facades\DB::table('inventory')->delete();
            \Illuminate\Support\Facades\DB::table('material_variants')->delete();
            \Illuminate\Support\Facades\DB::table('materials')->delete();
            \Illuminate\Support\Facades\DB::table('labour')->delete();
            
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

            return response()->json([
                'status' => 'success',
                'message' => 'Manufacturing database cleaned successfully! All products, materials, variants, stock ledgers, and artisans have been wiped clean. Your admin user account is preserved.',
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
            return response()->json([
                'status' => 'error',
                'message' => 'Database clean failed: ' . $e->getMessage(),
            ], 500);
        }
    })->name('system.clean-db');
});

require __DIR__.'/auth.php';
