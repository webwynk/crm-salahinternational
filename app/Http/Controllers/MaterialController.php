<?php

namespace App\Http\Controllers;

use App\Http\Requests\RestockMaterialRequest;
use App\Http\Requests\RestockVariantRequest;
use App\Http\Requests\StoreMaterialRequest;
use App\Http\Requests\StoreMaterialVariantRequest;
use App\Http\Requests\UpdateMaterialRequest;
use App\Models\Inventory;
use App\Models\Material;
use App\Models\MaterialVariant;
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
        $query = Material::query()->materialsOnly()->with(['variants.inventory', 'inventory']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('variants', function ($vq) use ($search) {
                      $vq->where('name', 'like', "%{$search}%")
                         ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $materials = $query->orderBy('name')->paginate($request->pageSize ?? 10)->withQueryString();
        $categories = Material::materialsOnly()->distinct()->pluck('category');

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
                'reorder_level' => $validated['reorder_level'] ?? 0,
                'is_active' => true,
            ]);

            $variantsData = $validated['variants'] ?? [];

            if (!empty($variantsData)) {
                foreach ($variantsData as $vData) {
                    $variant = MaterialVariant::create([
                        'material_id'   => $material->id,
                        'name'          => $vData['name'],
                        'sku'           => $vData['sku'] ?? null,
                        'reorder_level' => $vData['reorder_level'] ?? 0,
                        'is_active'     => true,
                    ]);

                    $initialStock = (float) ($vData['initial_stock'] ?? 0);

                    Inventory::create([
                        'material_id'         => $material->id,
                        'material_variant_id' => $variant->id,
                        'quantity_on_hand'    => $initialStock,
                        'unit'                => $validated['base_unit'],
                    ]);

                    if ($initialStock > 0) {
                        StockTransaction::create([
                            'material_id'         => $material->id,
                            'material_variant_id' => $variant->id,
                            'change_qty'          => $initialStock,
                            'type'                => StockTransaction::TYPE_RESTOCK,
                            'balance_after'       => $initialStock,
                            'note'                => "Initial inventory stock for variant '{$variant->name}'",
                            'created_by'          => $request->user()->id,
                        ]);
                    }
                }
            } else {
                $initialStock = (float) ($validated['initial_stock'] ?? 0);
                $reorderLevel = (float) ($validated['reorder_level'] ?? 0);

                $variant = MaterialVariant::create([
                    'material_id'   => $material->id,
                    'name'          => 'Standard',
                    'sku'           => null,
                    'reorder_level' => $reorderLevel,
                    'is_active'     => true,
                ]);

                Inventory::create([
                    'material_id'         => $material->id,
                    'material_variant_id' => $variant->id,
                    'quantity_on_hand'    => $initialStock,
                    'unit'                => $validated['base_unit'],
                ]);

                if ($initialStock > 0) {
                    StockTransaction::create([
                        'material_id'         => $material->id,
                        'material_variant_id' => $variant->id,
                        'change_qty'          => $initialStock,
                        'type'                => StockTransaction::TYPE_RESTOCK,
                        'balance_after'       => $initialStock,
                        'note'                => 'Initial inventory stock creation',
                        'created_by'          => $request->user()->id,
                    ]);
                }
            }
        });

        return redirect()->route('materials.index')->with('success', "Material '{$material->name}' added successfully.");
    }

    public function storeVariant(StoreMaterialVariantRequest $request, Material $material): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $material, $request, &$variant) {
            $variant = MaterialVariant::create([
                'material_id'   => $material->id,
                'name'          => $validated['name'],
                'sku'           => $validated['sku'] ?? null,
                'reorder_level' => $validated['reorder_level'] ?? 0,
                'is_active'     => true,
            ]);

            $initialStock = (float) ($validated['initial_stock'] ?? 0);

            Inventory::create([
                'material_id'         => $material->id,
                'material_variant_id' => $variant->id,
                'quantity_on_hand'    => $initialStock,
                'unit'                => $material->base_unit,
            ]);

            if ($initialStock > 0) {
                StockTransaction::create([
                    'material_id'         => $material->id,
                    'material_variant_id' => $variant->id,
                    'change_qty'          => $initialStock,
                    'type'                => StockTransaction::TYPE_RESTOCK,
                    'balance_after'       => $initialStock,
                    'note'                => "Initial inventory stock for variant '{$variant->name}'",
                    'created_by'          => $request->user()->id,
                ]);
            }
        });

        return redirect()->route('materials.index')->with('success', "Variation '{$variant->name}' added to '{$material->name}'.");
    }

    public function restockVariant(RestockVariantRequest $request, MaterialVariant $variant): RedirectResponse
    {
        $validated = $request->validated();
        $material = $variant->material;

        $inv = Inventory::firstOrCreate(
            ['material_variant_id' => $variant->id],
            [
                'material_id'      => $material->id,
                'quantity_on_hand' => 0,
                'unit'             => $material->base_unit,
            ]
        );

        $inv->increment('quantity_on_hand', $validated['add_quantity']);

        StockTransaction::create([
            'material_id'         => $material->id,
            'material_variant_id' => $variant->id,
            'change_qty'          => $validated['add_quantity'],
            'type'                => StockTransaction::TYPE_RESTOCK,
            'balance_after'       => $inv->fresh()->quantity_on_hand,
            'note'                => $validated['note'] ?? "Restock for variant '{$variant->name}'",
            'created_by'          => $request->user()->id,
        ]);

        return redirect()->route('materials.index')->with(
            'success',
            "Restocked {$validated['add_quantity']} {$material->base_unit} for '{$material->name} ({$variant->name})'."
        );
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

        // Find or create default variant
        $variant = $material->variants()->first();

        $inv = Inventory::where('material_id', $material->id)
            ->when($variant, fn($q) => $q->where('material_variant_id', $variant->id))
            ->first();

        if (!$inv) {
            $inv = Inventory::create([
                'material_id'         => $material->id,
                'material_variant_id' => $variant?->id,
                'quantity_on_hand'    => 0,
                'unit'                => $material->base_unit,
            ]);
        }

        $inv->increment('quantity_on_hand', $validated['add_quantity']);

        StockTransaction::create([
            'material_id'         => $material->id,
            'material_variant_id' => $variant?->id,
            'change_qty'          => $validated['add_quantity'],
            'type'                => StockTransaction::TYPE_RESTOCK,
            'balance_after'       => $inv->fresh()->quantity_on_hand,
            'note'                => $validated['note'] ?? 'Manual stock replenishment',
            'created_by'          => $request->user()->id,
        ]);

        return redirect()->route('materials.index')->with('success', "Restocked {$validated['add_quantity']} {$material->base_unit} for '{$material->name}'.");
    }

    public function destroyVariant(MaterialVariant $variant): RedirectResponse
    {
        if ($variant->productMaterials()->exists()) {
            return back()->with('error', "Cannot delete variant '{$variant->name}' because it is actively used in Product BOM.");
        }

        if ($variant->assignmentMaterials()->exists()) {
            return back()->with('error', "Cannot delete variant '{$variant->name}' because it has historical work order assignments.");
        }

        $material = $variant->material;

        if ($material->variants()->count() <= 1) {
            return back()->with('error', "Cannot delete the only variation of '{$material->name}'. To delete the entire material, delete the parent material instead.");
        }

        $name = $variant->name;

        DB::transaction(function () use ($variant) {
            $variant->stockTransactions()->delete();
            $variant->inventory()->delete();
            $variant->delete();
        });

        return redirect()->route('materials.index')->with('success', "Variation '{$name}' was deleted successfully.");
    }

    public function destroy(Material $material): RedirectResponse
    {
        if ($material->productMaterials()->exists() || $material->variants()->whereHas('productMaterials')->exists()) {
            return back()->with('error', "Cannot delete material '{$material->name}' because it is actively used in Product Bill of Materials (BOM).");
        }

        if ($material->assignmentMaterials()->exists() || $material->variants()->whereHas('assignmentMaterials')->exists()) {
            return back()->with('error', "Cannot delete material '{$material->name}' because it has historical work order assignments.");
        }

        $name = $material->name;

        DB::transaction(function () use ($material) {
            $material->stockTransactions()->delete();
            foreach ($material->variants as $variant) {
                $variant->stockTransactions()->delete();
                $variant->inventory()->delete();
            }
            $material->variants()->delete();
            $material->inventories()->delete();
            $material->delete();
        });

        return redirect()->route('materials.index')->with('success', "Material '{$name}' was deleted successfully.");
    }
}
