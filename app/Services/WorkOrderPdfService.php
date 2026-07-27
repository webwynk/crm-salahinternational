<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\WorkOrderPdf;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class WorkOrderPdfService
{
    /**
     * Generate Work Order PDF and store in storage/app/public/work_orders/
     */
    public function generatePdf(Assignment $assignment, ?int $generatedByUserId = null): WorkOrderPdf
    {
        $assignment->load(['product.materials', 'labour', 'materials', 'assigner']);

        $pdf = Pdf::loadView('pdf.work_order', [
            'assignment' => $assignment,
            'product'    => $assignment->product,
            'labour'     => $assignment->labour,
            'materials'  => $assignment->materials,
            'bomNotes'   => $assignment->product->materials->where('material_type', 'PROCESS_NOTE'),
        ]);

        $fileName = "work_order_{$assignment->assignment_no}.pdf";
        $relativePath = "work_orders/{$fileName}";

        // Save PDF to public storage
        Storage::disk('public')->put($relativePath, $pdf->output());

        return WorkOrderPdf::create([
            'assignment_id' => $assignment->id,
            'file_path'     => $relativePath,
            'generated_by'  => $generatedByUserId,
            'generated_at'  => now(),
        ]);
    }
}
