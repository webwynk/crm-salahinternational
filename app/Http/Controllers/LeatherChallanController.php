<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Http\Requests\StoreLeatherChallanRequest;
use App\Models\Cutter;
use App\Models\LeatherChallan;
use App\Models\Material;
use App\Models\Product;
use App\Services\LeatherChallanPdfService;
use App\Services\LeatherChallanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class LeatherChallanController extends Controller
{
    public function index(Request $request): Response
    {
        $query = LeatherChallan::query()
            ->with(['cutter', 'material', 'variant', 'items.product', 'creator'])
            ->withCount('items');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('challan_no', 'like', "%{$search}%")
                  ->orWhereHas('cutter', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  })
                  ->orWhereHas('material', function ($mq) use ($search) {
                      $mq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $challans = $query->orderByDesc('created_at')->paginate($request->pageSize ?? 10)->withQueryString();

        return Inertia::render('Leather/Challans', [
            'challans' => $challans,
            'filters'  => $request->only(['search', 'status', 'pageSize']),
        ]);
    }

    public function create(): Response
    {
        $cutters = Cutter::where('is_active', true)->orderBy('name')->get(['id', 'name', 'phone', 'address']);

        $materials = Material::leather()
            ->where('is_active', true)
            ->with(['variants.inventory', 'inventory'])
            ->orderBy('name')
            ->get();

        $products = Product::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'part_no', 'name', 'leather_sqft']);

        return Inertia::render('Leather/MakeChallan', [
            'cutters'   => $cutters,
            'materials' => $materials,
            'products'  => $products,
        ]);
    }

    public function store(StoreLeatherChallanRequest $request, LeatherChallanService $service): RedirectResponse
    {
        try {
            $challan = $service->createChallan($request->validated(), $request->user()->id);

            return redirect()->route('leather.challans.index')
                ->with('success', "Leather Cutting Challan #{$challan->challan_no} generated successfully.")
                ->with('download_challan_id', $challan->id);
        } catch (InsufficientStockException $e) {
            return back()->withErrors(['stock' => $e->getMessage()])->withInput();
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => 'Failed to create challan: ' . $e->getMessage()])->withInput();
        }
    }

    public function downloadPdf(LeatherChallan $challan, LeatherChallanPdfService $pdfService): SymfonyResponse
    {
        $pdf = $pdfService->renderDomPdf($challan);
        return $pdf->stream("challan_{$challan->challan_no}.pdf");
    }

    public function cancel(LeatherChallan $challan, LeatherChallanService $service): RedirectResponse
    {
        try {
            $service->cancelChallan($challan, auth()->id());
            return redirect()->back()->with('success', "Challan #{$challan->challan_no} has been cancelled and leather stock refunded.");
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to cancel challan: ' . $e->getMessage()]);
        }
    }
}
