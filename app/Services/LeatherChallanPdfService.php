<?php

namespace App\Services;

use App\Models\LeatherChallan;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdfWrapper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class LeatherChallanPdfService
{
    /**
     * Relative storage path for the Leather Cutting Challan PDF.
     */
    public function getStorageRelativePath(LeatherChallan $challan): string
    {
        $fileName = "challan_{$challan->challan_no}.pdf";
        return "leather_challans/{$fileName}";
    }

    /**
     * Render the DomPDF object in memory.
     */
    public function renderDomPdf(LeatherChallan $challan): DomPdfWrapper
    {
        $challan->loadMissing([
            'cutter',
            'material',
            'variant',
            'items.product',
            'creator',
        ]);

        $logoPath = public_path('images/salah_logo.png');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        return Pdf::loadView('pdf.leather_challan', [
            'challan'    => $challan,
            'logoBase64' => $logoBase64,
        ])->setPaper('a4', 'portrait');
    }

    /**
     * Generate Leather Cutting Challan PDF, store on disk, and update pdf_path on challan.
     */
    public function generatePdf(LeatherChallan $challan): DomPdfWrapper
    {
        $pdf = $this->renderDomPdf($challan);
        $relativePath = $this->getStorageRelativePath($challan);

        try {
            Storage::disk('public')->put($relativePath, $pdf->output());
            $challan->update(['pdf_path' => $relativePath]);
        } catch (\Throwable $e) {
            Log::error("Failed to write Leather Challan PDF to storage disk: " . $e->getMessage());
        }

        return $pdf;
    }
}
