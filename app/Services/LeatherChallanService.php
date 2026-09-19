<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Inventory;
use App\Models\LeatherChallan;
use App\Models\LeatherChallanItem;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\DB;

class LeatherChallanService
{
    public function __construct(
        protected LeatherChallanPdfService $pdfService
    ) {}

    /**
     * Create Leather Cutting Challan with transactional row-level locked stock deduction.
     *
     * @param array $validated
     * @param int $userId
     * @return LeatherChallan
     * @throws InsufficientStockException
     */
    public function createChallan(array $validated, int $userId): LeatherChallan
    {
        return DB::transaction(function () use ($validated, $userId) {
            // Calculate total leather sqft across all product lines
            $totalSqFt = 0.0;
            foreach ($validated['items'] as $item) {
                $lineTotal = (float) $item['quantity'] * (float) $item['leather_sqft_per_pc'];
                $totalSqFt += $lineTotal;
            }

            // Lock inventory row FOR UPDATE to prevent race conditions
            $invQuery = Inventory::where('material_id', $validated['material_id']);
            if (!empty($validated['material_variant_id'])) {
                $invQuery->where('material_variant_id', $validated['material_variant_id']);
            }
            /** @var Inventory|null $inv */
            $inv = $invQuery->lockForUpdate()->first();

            // Fallback to any inventory row for this material if variant-specific is missing
            if (!$inv) {
                $inv = Inventory::where('material_id', $validated['material_id'])->lockForUpdate()->first();
            }

            if (!$inv || (float) $inv->quantity_on_hand < $totalSqFt) {
                $available = $inv ? (float) $inv->quantity_on_hand : 0.0;
                throw new InsufficientStockException(
                    "Not enough leather in stock ({$available} sq. ft available, {$totalSqFt} sq. ft required)."
                );
            }

            // Generate sequential unique Challan Number
            $year = now()->year;
            $prefix = sprintf('LC-%d-', $year);
            $maxChallanNo = LeatherChallan::where('challan_no', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->max('challan_no');

            $seq = 1;
            if ($maxChallanNo) {
                $lastSeq = (int) substr($maxChallanNo, strlen($prefix));
                $seq = $lastSeq + 1;
            }
            $challanNo = sprintf('LC-%d-%04d', $year, $seq);

            // Deduct stock from inventory
            $inv->decrement('quantity_on_hand', $totalSqFt);

            // Create Challan record
            $challan = LeatherChallan::create([
                'challan_no'          => $challanNo,
                'cutter_id'           => $validated['cutter_id'],
                'material_id'         => $validated['material_id'],
                'material_variant_id' => $validated['material_variant_id'] ?? null,
                'total_sqft'          => $totalSqFt,
                'notes'               => $validated['notes'] ?? null,
                'status'              => LeatherChallan::STATUS_ISSUED,
                'created_by'          => $userId,
            ]);

            // Create line items
            foreach ($validated['items'] as $item) {
                $lineTotal = (float) $item['quantity'] * (float) $item['leather_sqft_per_pc'];
                LeatherChallanItem::create([
                    'leather_challan_id'  => $challan->id,
                    'product_id'          => $item['product_id'],
                    'quantity'            => $item['quantity'],
                    'leather_sqft_per_pc' => $item['leather_sqft_per_pc'],
                    'total_sqft'          => $lineTotal,
                ]);
            }

            // Record stock transaction ledger entry
            StockTransaction::create([
                'material_id'         => $validated['material_id'],
                'material_variant_id' => $validated['material_variant_id'] ?? null,
                'change_qty'          => -$totalSqFt,
                'type'                => StockTransaction::TYPE_ASSIGNMENT_DEDUCTION,
                'reference_id'        => $challan->id,
                'balance_after'       => $inv->fresh()->quantity_on_hand,
                'note'                => "Auto-deducted for Leather Cutting Challan #{$challanNo}",
                'created_by'          => $userId,
                'created_at'          => now(),
            ]);

            // Generate official PDF and save to disk
            $this->pdfService->generatePdf($challan);

            return $challan;
        });
    }

    /**
     * Cancel Challan and refund deducted leather stock back to inventory.
     *
     * @param LeatherChallan $challan
     * @param int $userId
     * @return LeatherChallan
     */
    public function cancelChallan(LeatherChallan $challan, int $userId): LeatherChallan
    {
        return DB::transaction(function () use ($challan, $userId) {
            if ($challan->status === LeatherChallan::STATUS_CANCELLED) {
                return $challan;
            }

            // Find and lock inventory row
            $invQuery = Inventory::where('material_id', $challan->material_id);
            if ($challan->material_variant_id) {
                $invQuery->where('material_variant_id', $challan->material_variant_id);
            }
            $inv = $invQuery->lockForUpdate()->first();

            if (!$inv) {
                $inv = Inventory::where('material_id', $challan->material_id)->lockForUpdate()->first();
            }

            if ($inv) {
                $inv->increment('quantity_on_hand', (float) $challan->total_sqft);

                StockTransaction::create([
                    'material_id'         => $challan->material_id,
                    'material_variant_id' => $challan->material_variant_id,
                    'change_qty'          => (float) $challan->total_sqft,
                    'type'                => StockTransaction::TYPE_ASSIGNMENT_REVERSAL,
                    'reference_id'        => $challan->id,
                    'balance_after'       => $inv->fresh()->quantity_on_hand,
                    'note'                => "Stock refunded for cancelled Leather Cutting Challan #{$challan->challan_no}",
                    'created_by'          => $userId,
                    'created_at'          => now(),
                ]);
            }

            $challan->update([
                'status' => LeatherChallan::STATUS_CANCELLED,
            ]);

            return $challan;
        });
    }
}
