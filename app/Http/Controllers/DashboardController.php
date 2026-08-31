<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Inventory;
use App\Models\Labour;
use App\Models\Material;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $totalProducts = Product::where('is_active', true)->count();
        $totalMaterials = Material::where('is_active', true)->count();
        $totalLabour = Labour::where('is_active', true)->count();
        $activeAssignments = Assignment::where('status', 'ASSIGNED')->count();

        // Low stock count (quantity_on_hand <= reorder_level) via pure SQL query
        $lowStockQuery = Inventory::with('material')
            ->join('materials', 'inventory.material_id', '=', 'materials.id')
            ->where('materials.is_active', true)
            ->whereColumn('inventory.quantity_on_hand', '<=', 'materials.reorder_level');

        $lowStockCount = (clone $lowStockQuery)->count();
        $lowStockMaterials = $lowStockQuery->select('inventory.*')->take(5)->get();

        $recentAssignments = Assignment::with(['product', 'labour'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'total_materials' => $totalMaterials,
                'total_labour' => $totalLabour,
                'active_assignments' => $activeAssignments,
                'low_stock_count' => $lowStockCount,
            ],
            'low_stock_materials' => $lowStockMaterials,
            'recent_assignments' => $recentAssignments,
        ]);
    }
}
