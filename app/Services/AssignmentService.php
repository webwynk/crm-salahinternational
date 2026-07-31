<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Assignment;
use App\Models\AssignmentMaterial;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\DB;

class AssignmentService
{
    /**
     * Dry-run check for material stock availability before assignment.
     *
     * @return array{can_assign: bool, items: list<array{material_id: int|null, label: string, unit: string, needed: float, available: float, is_sufficient: bool, shortage: float}>}
     */
    public function checkStockAvailability(int|string $productId, int $quantity): array
    {
        $product = Product::with('materials.material.inventory')->findOrFail($productId);
        /** @var \Illuminate\Database\Eloquent\Collection<int, ProductMaterial> $bom */
        $bom = $product->materials->where('material_type', 'CONSUMABLE');

        $items = [];
        $hasInsufficient = false;

        foreach ($bom as $item) {
            if (!$item->material_id) continue;

            $mat = $item->material;
            $needed = $item->deductionQty() * $quantity;
            $available = ($mat && $mat->inventory) ? (float) $mat->inventory->quantity_on_hand : 0.0;
            $isShort = $available < $needed;

            if ($isShort) {
                $hasInsufficient = true;
            }

            $items[] = [
                'material_id'   => $item->material_id,
                'label'         => $item->label,
                'unit'          => $item->unit ?? ($mat ? $mat->base_unit : 'pcs'),
                'needed'        => $needed,
                'available'     => $available,
                'is_sufficient' => !$isShort,
                'shortage'      => $isShort ? ($needed - $available) : 0,
            ];
        }

        return [
            'can_assign' => !$hasInsufficient,
            'items'      => $items,
        ];
    }

    /**
     * Create work order assignment with transactional row-level locked stock deduction.
     */
    public function createAssignment(int|string $productId, int|string $labourId, int $quantity, int|string $assignedByUserId, ?string $notes = null): Assignment
    {
        return DB::transaction(function () use ($productId, $labourId, $quantity, $assignedByUserId, $notes) {
            $product = Product::with('materials')->findOrFail($productId);
            /** @var \Illuminate\Database\Eloquent\Collection<int, ProductMaterial> $bom */
            $bom = $product->materials->where('material_type', 'CONSUMABLE');

            // Lock inventory rows FOR UPDATE to prevent race conditions under high concurrency
            $lockedInventory = [];
            foreach ($bom as $item) {
                if (!$item->material_id) continue;

                $needed = $item->deductionQty() * $quantity;

                /** @var Inventory|null $inv */
                $inv = Inventory::where('material_id', $item->material_id)->lockForUpdate()->first();

                if (!$inv || (float)$inv->quantity_on_hand < $needed) {
                    $availableQty = $inv ? (float) $inv->quantity_on_hand : 0.0;
                    $unitStr = $item->unit ?? ($inv ? $inv->unit : 'pcs');
                    throw new InsufficientStockException(
                        "Not enough {$item->label} in stock ({$availableQty} {$unitStr} available, {$needed} {$unitStr} needed)."
                    );
                }

                $lockedInventory[$item->material_id] = [
                    'needed' => $needed,
                    'item'   => $item,
                    'inv'    => $inv,
                ];
            }

            // Lock & fetch max sequence for assignment_no to prevent race conditions
            $year = now()->year;
            $prefix = sprintf('WO-%d-', $year);
            $maxAssignmentNo = Assignment::where('assignment_no', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->max('assignment_no');

            $seq = 1;
            if ($maxAssignmentNo) {
                $lastSeq = (int) substr($maxAssignmentNo, strlen($prefix));
                $seq = $lastSeq + 1;
            }
            $assignmentNo = sprintf('WO-%d-%04d', $year, $seq);

            $assignment = Assignment::create([
                'assignment_no' => $assignmentNo,
                'product_id'    => $productId,
                'labour_id'     => $labourId,
                'quantity'      => $quantity,
                'assigned_by'   => $assignedByUserId,
                'status'        => 'ASSIGNED',
                'notes'         => $notes,
            ]);

            foreach ($lockedInventory as $materialId => $data) {
                AssignmentMaterial::create([
                    'assignment_id' => $assignment->id,
                    'material_id'   => $materialId,
                    'label'         => $data['item']->label,
                    'quantity_used' => $data['needed'],
                    'unit'          => $data['item']->unit ?? $data['inv']->unit,
                ]);

                /** @var Inventory $inv */
                $inv = $data['inv'];
                $inv->decrement('quantity_on_hand', $data['needed']);

                StockTransaction::create([
                    'material_id'   => $materialId,
                    'change_qty'    => -$data['needed'],
                    'type'          => StockTransaction::TYPE_ASSIGNMENT_DEDUCTION,
                    'reference_id'  => $assignment->id,
                    'balance_after' => $inv->fresh()->quantity_on_hand,
                    'note'          => "Auto-deducted for Work Order #{$assignment->assignment_no}",
                    'created_by'    => $assignedByUserId,
                ]);
            }
            return $assignment;
        });
    }
}
