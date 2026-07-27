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
        $activeAssignments = Assignment::whereIn('status', ['ASSIGNED', 'IN_PROGRESS'])->count();

        // Low stock count (quantity_on_hand <= reorder_level)
        $lowStockMaterials = Inventory::with('material')
            ->whereHas('material', fn ($q) => $q->where('is_active', true))
            ->get()
            ->filter(fn ($inv) => (float) $inv->quantity_on_hand <= (float) ($inv->material->reorder_level ?? 0))
            ->values();

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
                'low_stock_count' => $lowStockMaterials->count(),
            ],
            'low_stock_materials' => $lowStockMaterials->take(5),
            'recent_assignments' => $recentAssignments,
        ]);
    }
}
