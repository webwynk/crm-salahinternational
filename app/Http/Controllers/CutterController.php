<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCutterRequest;
use App\Models\Cutter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CutterController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Cutter::query()->withCount('challans');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $cutters = $query->orderBy('name')->paginate($request->pageSize ?? 10)->withQueryString();

        return Inertia::render('Leather/Cutters', [
            'cutters' => $cutters,
            'filters' => $request->only(['search', 'pageSize']),
        ]);
    }

    public function store(StoreCutterRequest $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();

        $cutter = Cutter::create([
            'name'      => $validated['name'],
            'phone'     => $validated['phone'],
            'address'   => $validated['address'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'notes'     => $validated['notes'] ?? null,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'cutter'  => $cutter,
                'message' => "Cutter '{$cutter->name}' added successfully.",
            ]);
        }

        return redirect()->route('leather.cutters.index')->with('success', "Cutter '{$cutter->name}' added successfully.");
    }

    public function update(StoreCutterRequest $request, Cutter $cutter): RedirectResponse
    {
        $validated = $request->validated();
        $cutter->update($validated);

        return redirect()->route('leather.cutters.index')->with('success', "Cutter '{$cutter->name}' updated successfully.");
    }
}
