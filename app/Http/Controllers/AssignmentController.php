<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssignmentRequest;
use App\Models\Assignment;
use App\Models\Labour;
use App\Models\Product;
use App\Services\AssignmentService;
use App\Services\LeatherIssuePdfService;
use App\Services\WorkOrderPdfService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class AssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Assignment::query()->with(['product', 'labour', 'assigner', 'pdfs']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('assignment_no', 'like', "%{$search}%")
                  ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%"))
                  ->orWhereHas('labour', fn($lq) => $lq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortColumn = $request->sort ?? 'created_at';
        $sortDirection = $request->direction ?? 'desc';
        $query->orderBy($sortColumn, $sortDirection);

        $assignments = $query->paginate($request->pageSize ?? 10)->withQueryString();

        return Inertia::render('Assignments/Index', [
            'assignments' => $assignments,
            'filters' => $request->only(['search', 'status', 'sort', 'direction', 'pageSize']),
        ]);
    }

    public function create(): Response
    {
        $products = Product::with(['materials.material.variants.inventory', 'materials.variant.inventory'])->where('is_active', true)->orderBy('name')->get();
        $labours = Labour::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Assignments/Create', [
            'products' => $products,
            'labours'  => $labours,
        ]);
    }

    public function preCheck(Request $request, AssignmentService $assignmentService): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);

        $result = $assignmentService->checkStockAvailability(
            $request->product_id,
            (int) $request->quantity
        );

        return response()->json($result);
    }

    public function store(StoreAssignmentRequest $request, AssignmentService $assignmentService, WorkOrderPdfService $pdfService): RedirectResponse
    {
        $validated = $request->validated();

        try {
            $assignment = $assignmentService->createAssignment(
                $validated['product_id'],
                $validated['labour_id'],
                (int) $validated['quantity'],
                $request->user()->id,
                $validated['notes'] ?? null
            );

            // Auto-generate Work Order PDF
            try {
                $pdfService->generatePdf($assignment, $request->user()->id);
            } catch (\Exception $pdfEx) {
                return redirect()->route('assignments.index')->with('warning', "Assignment #{$assignment->assignment_no} created and stock deducted, but PDF generation failed. You can retry generating PDF from the assignments list.");
            }

            return redirect()->route('assignments.index')->with('success', "Work Order #{$assignment->assignment_no} assigned successfully. Raw materials and leather hides deducted.");
        } catch (\Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function show(Assignment $assignment): Response
    {
        $assignment->load(['product.materials.material', 'labour', 'materials.material', 'materials.variant', 'assigner', 'pdfs']);

        return Inertia::render('Assignments/Show', [
            'assignment' => $assignment,
        ]);
    }

    public function downloadPdf(Assignment $assignment): BinaryFileResponse|RedirectResponse
    {
        $pdf = $assignment->pdfs()->latest()->first();

        if (!$pdf || !Storage::disk('public')->exists($pdf->file_path)) {
            // Regenerate PDF if missing
            $pdfService = new WorkOrderPdfService();
            $pdf = $pdfService->generatePdf($assignment, auth()->id());
        }

        $fullPath = Storage::disk('public')->path($pdf->file_path);
        return response()->download($fullPath, "Work_Order_{$assignment->assignment_no}.pdf");
    }

    public function downloadLeatherPdf(Assignment $assignment, LeatherIssuePdfService $leatherPdfService): HttpResponse
    {
        $pdf = $leatherPdfService->generatePdf($assignment, auth()->id());
        return $pdf->download("Leather_Issue_Slip_{$assignment->assignment_no}.pdf");
    }

    public function updateStatus(Request $request, Assignment $assignment, AssignmentService $assignmentService): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', \Illuminate\Validation\Rule::in(['COMPLETED', 'CANCELLED'])],
        ]);

        if ($assignment->status === 'COMPLETED' || $assignment->status === 'CANCELLED') {
            return back()->with('warning', "Work Order #{$assignment->assignment_no} is already {$assignment->status} and cannot be altered.");
        }

        if ($validated['status'] === 'CANCELLED') {
            $assignmentService->cancelAssignment($assignment, $request->user()->id);
            return back()->with('success', "Work Order #{$assignment->assignment_no} cancelled. All deducted raw materials have been refunded back to inventory stock.");
        }

        if ($validated['status'] === 'COMPLETED') {
            $assignmentService->completeAssignment($assignment);
            return back()->with('success', "Work Order #{$assignment->assignment_no} marked as COMPLETED.");
        }

        return back();
    }
}
