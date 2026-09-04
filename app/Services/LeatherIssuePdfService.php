<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\WorkOrderPdf;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdfWrapper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class LeatherIssuePdfService
{
    /**
     * Relative storage path for the Leather Cutting Issue Slip PDF.
     */
    public function getStorageRelativePath(Assignment $assignment): string
    {
        $fileName = "leather_slip_{$assignment->assignment_no}.pdf";
        return "leather_slips/{$fileName}";
    }

    /**
     * Render the DomPDF object for Leather Issue Slip in memory.
     *
     * @param Assignment $assignment
     * @return DomPdfWrapper
     */
    public function renderDomPdf(Assignment $assignment): DomPdfWrapper
    {
        $assignment->loadMissing([
            'product.materials.material',
            'color',
            'labour',
            'materials.material',
            'materials.variant',
            'assigner',
        ]);

        // Filter materials that are strictly raw leather
        $leatherMaterials = $assignment->materials->filter(function ($mat) {
            $isLeatherFlag = $mat->material && $mat->material->is_leather;
            $isLeatherUnit = in_array(strtolower(trim((string) $mat->unit)), ['sq_ft', 'sq_dm', 'sq_m', 'hides', 'sq ft', 'sqft']);
            return $isLeatherFlag || $isLeatherUnit;
        });

        $totalLeatherQty = (float) $leatherMaterials->sum('quantity_used');
        $rawUnit = $leatherMaterials->first()?->unit ?? 'SQ_FT';
        // Normalize unit display (e.g. sq_ft -> SQ_FT)
        $leatherUnit = strtoupper(str_replace(' ', '_', trim($rawUnit)));

        $logoPath = public_path('images/salah_logo.png');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        return Pdf::loadView('pdf.leather_issue_slip', [
            'assignment'       => $assignment,
            'product'          => $assignment->product,
            'color'            => $assignment->color,
            'labour'           => $assignment->labour,
            'leatherMaterials' => $leatherMaterials,
            'totalLeatherQty'  => $totalLeatherQty,
            'leatherUnit'      => $leatherUnit,
            'logoBase64'       => $logoBase64,
        ])->setPaper('a4', 'portrait');
    }

    /**
     * Generate Leather Issue Slip PDF, store on disk, and persist DB record in work_order_pdfs.
     *
     * @param Assignment $assignment
     * @param int|null $generatedByUserId
     * @return DomPdfWrapper
     */
    public function generatePdf(Assignment $assignment, ?int $generatedByUserId = null): DomPdfWrapper
    {
        $pdf = $this->renderDomPdf($assignment);
        $relativePath = $this->getStorageRelativePath($assignment);

        // Save PDF binary to public storage disk
        try {
            Storage::disk('public')->put($relativePath, $pdf->output());
        } catch (\Throwable $e) {
            Log::error("Failed to write Leather Issue Slip to storage disk: " . $e->getMessage());
        }

        // Defensively record in work_order_pdfs with copy_type = 'LEATHER'
        try {
            $matchAttributes = ['assignment_id' => $assignment->id];
            if (Schema::hasColumn('work_order_pdfs', 'copy_type')) {
                $matchAttributes['copy_type'] = 'LEATHER';
            }

            WorkOrderPdf::updateOrCreate($matchAttributes, [
                'file_path'    => $relativePath,
                'generated_by' => $generatedByUserId,
                'generated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning("WorkOrderPdf record could not be updated for LEATHER slip #{$assignment->id}: " . $e->getMessage());
        }

        return $pdf;
    }
}
