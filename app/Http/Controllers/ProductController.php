<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Material;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()->with('materials.material');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $sortColumn = $request->sort ?? 'created_at';
        $sortDirection = $request->direction ?? 'desc';
        $query->orderBy($sortColumn, $sortDirection);

        $products = $query->paginate($request->pageSize ?? 10)->withQueryString();
        $categories = Product::whereNotNull('category')->distinct()->pluck('category');

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'sort', 'direction', 'pageSize']),
        ]);
    }

    public function create(): Response
    {
        $leatherMaterials = Material::leather()->with('variants.inventory')->where('is_active', true)->orderBy('name')->get();
        $materials = Material::materialsOnly()->with('variants.inventory')->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Products/Create', [
            'leatherMaterials'  => $leatherMaterials,
            'materials'         => $materials,
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $hasColors = (bool) ($validated['has_colors'] ?? false);

        DB::transaction(function () use ($validated, $request, $hasColors, &$product) {
            $product = Product::create([
                'code' => strtoupper($validated['code']),
                'name' => $validated['name'],
                'category' => $validated['category'] ?? null,
                'description' => $validated['description'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
                'has_colors' => $hasColors,
                'created_by' => $request->user()->id,
            ]);

            if ($hasColors && !empty($validated['colors'])) {
                foreach ($validated['colors'] as $cIdx => $colorData) {
                    $color = $product->colors()->create([
                        'color_name' => $colorData['color_name'],
                        'image_url'  => $colorData['image_url'] ?? null,
                        'sort_order' => $cIdx + 1,
                        'is_active'  => true,
                    ]);
                    if (!empty($colorData['materials'])) {
                        $this->syncProductMaterials($product, $colorData['materials'], $color->id);
                    }
                }
            } elseif (!empty($validated['materials'])) {
                $this->syncProductMaterials($product, $validated['materials'], null);
            }
        });

        return redirect()->route('products.index')->with('success', "Product '{$product->name}' ({$product->code}) created successfully.");
    }

    public function show(Product $product): Response
    {
        $product->load([
            'materials.material.variants.inventory',
            'materials.variant.inventory',
            'colors.materials.material.variants.inventory',
            'colors.materials.variant.inventory',
            'assignments.labour',
            'assignments.color',
        ]);

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load([
            'materials.variant',
            'materials.material',
            'colors.materials.variant',
            'colors.materials.material',
        ]);
        $leatherMaterials = Material::leather()->with('variants.inventory')->where('is_active', true)->orderBy('name')->get();
        $materials = Material::materialsOnly()->with('variants.inventory')->where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Products/Edit', [
            'product'           => $product,
            'leatherMaterials'  => $leatherMaterials,
            'materials'         => $materials,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();
        $hasColors = (bool) ($validated['has_colors'] ?? false);

        DB::transaction(function () use ($validated, $hasColors, $product) {
            $product->update([
                'code' => strtoupper($validated['code']),
                'name' => $validated['name'],
                'category' => $validated['category'] ?? null,
                'description' => $validated['description'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
                'has_colors' => $hasColors,
            ]);

            if ($hasColors && !empty($validated['colors'])) {
                // Delete any previous single-color materials
                $product->materials()->whereNull('product_color_id')->delete();

                $sentColorIds = [];
                foreach ($validated['colors'] as $cIdx => $colorData) {
                    if (!empty($colorData['id'])) {
                        $color = $product->colors()->find($colorData['id']);
                        if ($color) {
                            $color->update([
                                'color_name' => $colorData['color_name'],
                                'image_url'  => $colorData['image_url'] ?? null,
                                'sort_order' => $cIdx + 1,
                            ]);
                            $sentColorIds[] = $color->id;
                            $color->materials()->delete();
                            if (!empty($colorData['materials'])) {
                                $this->syncProductMaterials($product, $colorData['materials'], $color->id);
                            }
                            continue;
                        }
                    }

                    $color = $product->colors()->create([
                        'color_name' => $colorData['color_name'],
                        'image_url'  => $colorData['image_url'] ?? null,
                        'sort_order' => $cIdx + 1,
                        'is_active'  => true,
                    ]);
                    $sentColorIds[] = $color->id;
                    if (!empty($colorData['materials'])) {
                        $this->syncProductMaterials($product, $colorData['materials'], $color->id);
                    }
                }

                // Clean up removed colors
                $product->colors()->whereNotIn('id', $sentColorIds)->delete();
            } else {
                // Single color mode: purge colors & materials, then sync single BOM
                $product->colors()->delete();
                $product->materials()->delete();
                if (!empty($validated['materials'])) {
                    $this->syncProductMaterials($product, $validated['materials'], null);
                }
            }
        });

        return redirect()->route('products.index')->with('success', "Product '{$product->name}' updated successfully.");
    }

    protected function syncProductMaterials(Product $product, array $materials, ?int $colorId = null): void
    {
        foreach ($materials as $index => $item) {
            $product->materials()->create([
                'product_color_id' => $colorId,
                'material_id' => $item['material_id'] ?? null,
                'material_variant_id' => $item['material_variant_id'] ?? null,
                'material_type' => $item['material_type'],
                'label' => $item['label'],
                'quantity_min' => $item['quantity_min'] ?? null,
                'quantity_max' => $item['quantity_max'] ?? null,
                'unit' => $item['unit'] ?? null,
                'dimension_note' => $item['dimension_note'] ?? null,
                'sort_order' => $index + 1,
            ]);
        }
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->assignments()->exists()) {
            return back()->with('error', "Cannot delete product '{$product->name}' because it has active or historical work order assignments.");
        }

        $name = $product->name;
        DB::transaction(function () use ($product) {
            $product->materials()->delete();
            $product->delete();
        });

        return redirect()->route('products.index')->with('success', "Product '{$name}' removed.");
    }
}
