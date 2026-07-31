<?php

namespace App\Http\Controllers;

use App\Http\Requests\RestockMaterialRequest;
use App\Http\Requests\StoreMaterialRequest;
use App\Http\Requests\UpdateMaterialRequest;
use App\Models\Inventory;
use App\Models\Material;
use App\Models\StockTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Material::query()->with('inventory');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $materials = $query->orderBy('name')->paginate($request->pageSize ?? 10)->withQueryString();
        $categories = Material::distinct()->pluck('category');

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'pageSize']),
        ]);
    }

    public function store(StoreMaterialRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request, &$material) {
            $material = Material::create([
                'name' => $validated['name'],
                'category' => $validated['category'],
                'base_unit' => $validated['base_unit'],
                'reorder_level' => $validated['reorder_level'],
                'is_active' => true,
            ]);

            Inventory::create([
                'material_id' => $material->id,
                'quantity_on_hand' => $validated['initial_stock'],
                'unit' => $validated['base_unit'],
            ]);

            if ($validated['initial_stock'] > 0) {
                StockTransaction::create([
                    'material_id' => $material->id,
                    'change_qty' => $validated['initial_stock'],
                    'type' => 'RESTOCK',
                    'balance_after' => $validated['initial_stock'],
                    'note' => 'Initial inventory stock creation',
                    'created_by' => $request->user()->id,
                ]);
            }
        });

        return redirect()->route('materials.index')->with('success', "Material '{$material->name}' added with {$validated['initial_stock']} {$material->base_unit} stock.");
    }

    public function update(UpdateMaterialRequest $request, Material $material): RedirectResponse
    {
        $validated = $request->validated();

        $material->update($validated);

        return redirect()->route('materials.index')->with('success', "Material '{$material->name}' updated successfully.");
    }

    public function restock(RestockMaterialRequest $request, Material $material): RedirectResponse
    {
        $validated = $request->validated();

        $inv = Inventory::where('material_id', $material->id)->firstOrFail();
        $inv->increment('quantity_on_hand', $validated['add_quantity']);

        StockTransaction::create([
            'material_id' => $material->id,
            'change_qty' => $validated['add_quantity'],
            'type' => 'RESTOCK',
            'balance_after' => $inv->fresh()->quantity_on_hand,
            'note' => $validated['note'] ?? 'Manual stock replenishment',
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('materials.index')->with('success', "Restocked {$validated['add_quantity']} {$material->base_unit} for '{$material->name}'.");
    }
}
