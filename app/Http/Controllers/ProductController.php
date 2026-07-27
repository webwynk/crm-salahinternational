<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Material;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $materials = Material::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Products/Create', [
            'materials' => $materials,
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $product = Product::create([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        foreach ($validated['materials'] as $index => $item) {
            $product->materials()->create([
                'material_id' => $item['material_id'] ?? null,
                'material_type' => $item['material_type'],
                'label' => $item['label'],
                'quantity_min' => $item['quantity_min'] ?? null,
                'quantity_max' => $item['quantity_max'] ?? null,
                'unit' => $item['unit'] ?? null,
                'dimension_note' => $item['dimension_note'] ?? null,
                'sort_order' => $index + 1,
            ]);
        }

        return redirect()->route('products.index')->with('success', "Product '{$product->name}' ({$product->code}) created successfully.");
    }

    public function show(Product $product): Response
    {
        $product->load('materials.material.inventory', 'assignments.labour');

        return Inertia::render('Products/Show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load('materials');
        $materials = Material::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'materials' => $materials,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        $product->update([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'],
        ]);

        $product->materials()->delete();
        foreach ($validated['materials'] as $index => $item) {
            $product->materials()->create([
                'material_id' => $item['material_id'] ?? null,
                'material_type' => $item['material_type'],
                'label' => $item['label'],
                'quantity_min' => $item['quantity_min'] ?? null,
                'quantity_max' => $item['quantity_max'] ?? null,
                'unit' => $item['unit'] ?? null,
                'dimension_note' => $item['dimension_note'] ?? null,
                'sort_order' => $index + 1,
            ]);
        }

        return redirect()->route('products.index')->with('success', "Product '{$product->name}' updated successfully.");
    }

    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->delete();

        return redirect()->route('products.index')->with('success', "Product '{$name}' removed.");
    }
}
