<?php

namespace App\Services;

use App\Models\Assignment;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdf;
use Illuminate\Support\Facades\Storage;

class LeatherIssuePdfService
{
    /**
     * Generate Leather Cutting Issue Slip PDF instance.
     */
    public function generatePdf(Assignment $assignment, ?int $generatedByUserId = null): DomPdf
    {
        $assignment->load(['product', 'labour', 'materials.material', 'materials.variant', 'assigner']);

        // Filter materials that are leather
        $leatherMaterials = $assignment->materials->filter(function ($mat) {
            $isLeatherFlag = $mat->material && $mat->material->is_leather;
            $isLeatherUnit = in_array(strtolower((string) $mat->unit), ['sq_ft', 'sq_dm', 'sq_m', 'hides', 'sq ft']);
            return $isLeatherFlag || $isLeatherUnit;
        });

        // If no leather items were matched specifically, display all assignment materials
        if ($leatherMaterials->isEmpty()) {
            $leatherMaterials = $assignment->materials;
        }

        $pdf = Pdf::loadView('pdf.leather_issue_slip', [
            'assignment'       => $assignment,
            'product'          => $assignment->product,
            'labour'           => $assignment->labour,
            'leatherMaterials' => $leatherMaterials,
        ]);

        $fileName = "leather_slip_{$assignment->assignment_no}.pdf";
        $relativePath = "leather_slips/{$fileName}";

        // Save PDF to public storage
        Storage::disk('public')->put($relativePath, $pdf->output());

        return $pdf;
    }
}
