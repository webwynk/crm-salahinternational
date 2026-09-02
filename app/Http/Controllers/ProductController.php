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

        DB::transaction(function () use ($validated, $request, &$product) {
            $product = Product::create([
                'code' => strtoupper($validated['code']),
                'name' => $validated['name'],
                'category' => $validated['category'] ?? null,
                'description' => $validated['description'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            $this->syncProductMaterials($product, $validated['materials']);
        });

        return redirect()->route('products.index')->with('success', "Product '{$product->name}' ({$product->code}) created successfully.");
    }

    public function show(Product $product): Response
    {
        $product->load('materials.material.variants.inventory', 'materials.variant.inventory', 'assignments.labour');

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load('materials.variant');
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

        DB::transaction(function () use ($validated, $product) {
            $product->update([
                'code' => strtoupper($validated['code']),
                'name' => $validated['name'],
                'category' => $validated['category'] ?? null,
                'description' => $validated['description'] ?? null,
                'image_url' => $validated['image_url'] ?? null,
            ]);

            $product->materials()->delete();
            $this->syncProductMaterials($product, $validated['materials']);
        });

        return redirect()->route('products.index')->with('success', "Product '{$product->name}' updated successfully.");
    }

    protected function syncProductMaterials(Product $product, array $materials): void
    {
        foreach ($materials as $index => $item) {
            $product->materials()->create([
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
