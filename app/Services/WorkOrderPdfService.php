<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\WorkOrderPdf;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdfWrapper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class WorkOrderPdfService
{
    /**
     * Render the DomPDF object in memory.
     *
     * @param Assignment $assignment
     * @param string $copyType 'FABRICATOR' or 'EXPORTER'
     * @return DomPdfWrapper
     */
    public function renderDomPdf(Assignment $assignment, string $copyType = 'FABRICATOR'): DomPdfWrapper
    {
        $assignment->loadMissing([
            'product.materials.material',
            'color',
            'labour',
            'materials.material',
            'materials.variant',
            'assigner',
        ]);

        $normalizedCopy = strtoupper($copyType) === 'EXPORTER' ? 'EXPORTER' : 'FABRICATOR';
        $copyTypeBanner = $normalizedCopy === 'EXPORTER' ? 'Exporter Copy' : 'Fabricator Copy';

        $logoPath = public_path('images/salah_logo.png');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        return Pdf::loadView('pdf.work_order', [
            'assignment' => $assignment,
            'product'    => $assignment->product,
            'color'      => $assignment->color,
            'labour'     => $assignment->labour,
            'materials'  => $assignment->materials,
            'logoBase64' => $logoBase64,
            'copyType'   => $copyTypeBanner,
        ])->setPaper('a4', 'portrait');
    }

    /**
     * Generate Work Order PDF, store in storage/app/public/work_orders/, and persist DB record.
     *
     * @param Assignment $assignment
     * @param int|null $generatedByUserId
     * @param string $copyType 'FABRICATOR' or 'EXPORTER'
     * @return WorkOrderPdf
     */
    public function generatePdf(Assignment $assignment, ?int $generatedByUserId = null, string $copyType = 'FABRICATOR'): WorkOrderPdf
    {
        $normalizedCopy = strtoupper($copyType) === 'EXPORTER' ? 'EXPORTER' : 'FABRICATOR';
        $pdf = $this->renderDomPdf($assignment, $normalizedCopy);

        $suffix = strtolower($normalizedCopy);
        $fileName = "work_order_{$assignment->assignment_no}_{$suffix}.pdf";
        $relativePath = "work_orders/{$fileName}";

        // Save PDF binary to public storage disk
        Storage::disk('public')->put($relativePath, $pdf->output());

        // Prepare database attributes defensively (checks if copy_type migration has run)
        $matchAttributes = ['assignment_id' => $assignment->id];
        try {
            if (Schema::hasColumn('work_order_pdfs', 'copy_type')) {
                $matchAttributes['copy_type'] = $normalizedCopy;
            }
        } catch (\Throwable $e) {
            // In case of any schema check failure, fallback to assignment_id only
        }

        $values = [
            'file_path'    => $relativePath,
            'generated_by' => $generatedByUserId,
            'generated_at' => now(),
        ];

        try {
            return WorkOrderPdf::updateOrCreate($matchAttributes, $values);
        } catch (\Throwable $e) {
            Log::warning("WorkOrderPdf DB record could not be updated for assignment #{$assignment->id}: " . $e->getMessage());

            // Return a lightweight unpersisted model instance containing the file path
            $fallback = new WorkOrderPdf($values);
            $fallback->assignment_id = $assignment->id;
            return $fallback;
        }
    }
}
