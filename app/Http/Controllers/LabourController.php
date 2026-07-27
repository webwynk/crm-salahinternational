<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLabourRequest;
use App\Http\Requests\UpdateLabourRequest;
use App\Models\Labour;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabourController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Labour::query()->withCount('assignments');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $labour = $query->orderBy('name')->paginate($request->pageSize ?? 10)->withQueryString();

        return Inertia::render('Labour/Index', [
            'labour' => $labour,
            'filters' => $request->only(['search', 'pageSize']),
        ]);
    }

    public function store(StoreLabourRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $worker = Labour::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'address' => $validated['address'] ?? null,
            'skill_tags' => $validated['skill_tags'] ?? [],
            'is_active' => true,
        ]);

        return redirect()->route('labour.index')->with('success', "Artisan '{$worker->name}' added successfully.");
    }

    public function update(UpdateLabourRequest $request, Labour $labour): RedirectResponse
    {
        $validated = $request->validated();

        $labour->update($validated);

        return redirect()->route('labour.index')->with('success', "Artisan '{$labour->name}' details updated.");
    }
}
