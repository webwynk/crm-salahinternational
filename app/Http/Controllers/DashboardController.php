<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Inventory;
use App\Models\Labour;
use App\Models\Material;
use App\Models\MaterialVariant;
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
        $totalVariants = MaterialVariant::where('is_active', true)->count();
        $totalLabour = Labour::where('is_active', true)->count();
        
        $activeAssignmentsQuery = Assignment::where('status', 'ASSIGNED');
        $activeAssignments = (clone $activeAssignmentsQuery)->count();
        $totalUnitsInProduction = (clone $activeAssignmentsQuery)->sum('quantity');
        $completedAssignmentsCount = Assignment::where('status', 'COMPLETED')->count();

        // Low stock count (quantity_on_hand <= reorder_level for variant or master material)
        $lowStockQuery = Inventory::with(['material', 'variant'])
            ->join('materials', 'inventory.material_id', '=', 'materials.id')
            ->leftJoin('material_variants', 'inventory.material_variant_id', '=', 'material_variants.id')
            ->where('materials.is_active', true)
            ->whereRaw('inventory.quantity_on_hand <= COALESCE(material_variants.reorder_level, materials.reorder_level, 0)')
            ->whereRaw('COALESCE(material_variants.reorder_level, materials.reorder_level, 0) > 0');

        $lowStockCount = (clone $lowStockQuery)->count();
        $lowStockMaterials = $lowStockQuery->select('inventory.*')->take(6)->get();

        $totalLeatherSqFt = (float) Inventory::join('materials', 'inventory.material_id', '=', 'materials.id')
            ->where('materials.is_leather', true)
            ->where('materials.is_active', true)
            ->sum('inventory.quantity_on_hand');

        $recentAssignments = Assignment::with(['product', 'labour', 'pdfs'])
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_products' => $totalProducts,
                'total_materials' => $totalMaterials,
                'total_variants' => $totalVariants,
                'total_leather_sq_ft' => $totalLeatherSqFt,
                'total_labour' => $totalLabour,
                'active_assignments' => $activeAssignments,
                'total_units_in_production' => (int) $totalUnitsInProduction,
                'completed_assignments_count' => $completedAssignmentsCount,
                'low_stock_count' => $lowStockCount,
            ],
            'low_stock_materials' => $lowStockMaterials,
            'recent_assignments' => $recentAssignments,
        ]);
    }
}
