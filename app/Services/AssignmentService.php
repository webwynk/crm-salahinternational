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
     * @return array{can_assign: bool, items: list<array{material_id: int|null, material_variant_id: int|null, label: string, unit: string, needed: float, available: float, is_sufficient: bool, shortage: float}>}
     */
    public function checkStockAvailability(int|string $productId, int $quantity, int|string|null $productColorId = null): array
    {
        $product = Product::with(['materials.material.variants.inventory', 'materials.variant.inventory', 'colors'])->findOrFail($productId);
        /** @var \Illuminate\Database\Eloquent\Collection<int, ProductMaterial> $bom */
        if ($productColorId) {
            $bom = $product->materials->where('product_color_id', (int) $productColorId)->filter(fn($m) => !is_null($m->material_id));
        } elseif ($product->has_colors && $product->colors->isNotEmpty()) {
            $firstColor = $product->colors->first();
            $bom = $product->materials->where('product_color_id', $firstColor->id)->filter(fn($m) => !is_null($m->material_id));
        } else {
            $bom = $product->materials->whereNull('product_color_id')->filter(fn($m) => !is_null($m->material_id));
        }

        $items = [];
        $hasInsufficient = false;

        foreach ($bom as $item) {
            if (!$item->material_id) continue;

            $mat = $item->material;
            $variant = $item->variant ?: ($mat?->variants?->first());
            $needed = $item->deductionQty() * $quantity;

            $inv = $variant?->inventory;
            if (!$inv && $mat) {
                $inv = $mat->inventory;
            }

            $available = $inv ? (float) $inv->quantity_on_hand : 0.0;
            $isShort = $available < $needed;

            if ($isShort) {
                $hasInsufficient = true;
            }

            $variantSuffix = ($variant && $variant->name !== 'Standard') ? " ({$variant->name})" : '';

            $items[] = [
                'material_id'         => $item->material_id,
                'material_variant_id' => $variant?->id,
                'label'               => $item->label . $variantSuffix,
                'unit'                => $item->unit ?? ($mat ? $mat->base_unit : 'pcs'),
                'needed'              => $needed,
                'available'           => $available,
                'is_sufficient'       => !$isShort,
                'shortage'            => $isShort ? ($needed - $available) : 0,
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
    public function createAssignment(
        int|string $productId,
        int|string $labourId,
        int $quantity,
        int|string $assignedByUserId,
        ?string $notes = null,
        int|string|null $productColorId = null
    ): Assignment {
        return DB::transaction(function () use ($productId, $labourId, $quantity, $assignedByUserId, $notes, $productColorId) {
            $product = Product::with(['materials.material.variants', 'materials.variant', 'colors'])->findOrFail($productId);
            /** @var \Illuminate\Database\Eloquent\Collection<int, ProductMaterial> $bom */
            if ($productColorId) {
                $bom = $product->materials->where('product_color_id', (int) $productColorId)->filter(fn($m) => !is_null($m->material_id));
            } elseif ($product->has_colors && $product->colors->isNotEmpty()) {
                $firstColor = $product->colors->first();
                $bom = $product->materials->where('product_color_id', $firstColor->id)->filter(fn($m) => !is_null($m->material_id));
                $productColorId = $firstColor->id;
            } else {
                $bom = $product->materials->whereNull('product_color_id')->filter(fn($m) => !is_null($m->material_id));
            }

            // Lock inventory rows FOR UPDATE to prevent race conditions under high concurrency
            $lockedInventory = [];
            foreach ($bom as $item) {
                if (!$item->material_id) continue;

                $mat = $item->material;
                $variant = $item->variant ?: ($mat?->variants?->first());
                $variantId = $variant?->id;

                $needed = $item->deductionQty() * $quantity;

                /** @var Inventory|null $inv */
                $query = Inventory::where('material_id', $item->material_id);
                if ($variantId) {
                    $query->where('material_variant_id', $variantId);
                }
                $inv = $query->lockForUpdate()->first();

                // Fallback to any inventory row for this material if variant-specific is missing
                if (!$inv) {
                    $inv = Inventory::where('material_id', $item->material_id)->lockForUpdate()->first();
                }

                if (!$inv || (float)$inv->quantity_on_hand < $needed) {
                    $availableQty = $inv ? (float) $inv->quantity_on_hand : 0.0;
                    $unitStr = $item->unit ?? ($inv ? $inv->unit : 'pcs');
                    $varLabel = ($variant && $variant->name !== 'Standard') ? " ({$variant->name})" : '';
                    throw new InsufficientStockException(
                        "Not enough {$item->label}{$varLabel} in stock ({$availableQty} {$unitStr} available, {$needed} {$unitStr} needed)."
                    );
                }

                $key = $item->material_id . '_' . ($variantId ?? '0');
                $lockedInventory[$key] = [
                    'material_id'         => $item->material_id,
                    'material_variant_id' => $variantId,
                    'needed'              => $needed,
                    'item'                => $item,
                    'inv'                 => $inv,
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
                'assignment_no'    => $assignmentNo,
                'product_id'       => $productId,
                'product_color_id' => $productColorId ? (int) $productColorId : null,
                'labour_id'        => $labourId,
                'quantity'         => $quantity,
                'assigned_by'      => $assignedByUserId,
                'status'           => 'ASSIGNED',
                'notes'            => $notes,
            ]);

            foreach ($lockedInventory as $data) {
                AssignmentMaterial::create([
                    'assignment_id'       => $assignment->id,
                    'material_id'         => $data['material_id'],
                    'material_variant_id' => $data['material_variant_id'],
                    'label'               => $data['item']->label,
                    'quantity_used'       => $data['needed'],
                    'unit'                => $data['item']->unit ?? $data['inv']->unit,
                ]);

                /** @var Inventory $inv */
                $inv = $data['inv'];
                $inv->decrement('quantity_on_hand', $data['needed']);

                StockTransaction::create([
                    'material_id'         => $data['material_id'],
                    'material_variant_id' => $data['material_variant_id'],
                    'change_qty'          => -$data['needed'],
                    'type'                => StockTransaction::TYPE_ASSIGNMENT_DEDUCTION,
                    'reference_id'        => $assignment->id,
                    'balance_after'       => $inv->fresh()->quantity_on_hand,
                    'note'                => "Auto-deducted for Work Order #{$assignment->assignment_no}",
                    'created_by'          => $assignedByUserId,
                ]);
            }
            return $assignment;
        });
    }

    /**
     * Complete a work order assignment.
     */
    public function completeAssignment(Assignment $assignment): Assignment
    {
        return DB::transaction(function () use ($assignment) {
            if ($assignment->status === 'CANCELLED') {
                throw new \InvalidArgumentException("Cannot complete a cancelled work order.");
            }

            $assignment->update([
                'status'       => 'COMPLETED',
                'completed_at' => now(),
            ]);

            return $assignment;
        });
    }

    /**
     * Cancel a work order assignment and atomically refund all deducted raw materials back to inventory stock.
     */
    public function cancelAssignment(Assignment $assignment, int|string $userId): Assignment
    {
        return DB::transaction(function () use ($assignment, $userId) {
            if ($assignment->status === 'CANCELLED') {
                return $assignment; // Idempotent: already cancelled and refunded
            }

            $assignment->load('materials');

            foreach ($assignment->materials as $mat) {
                if (!$mat->material_id) continue;

                $query = Inventory::where('material_id', $mat->material_id);
                if ($mat->material_variant_id) {
                    $query->where('material_variant_id', $mat->material_variant_id);
                }
                $inv = $query->lockForUpdate()->first();

                if (!$inv) {
                    $inv = Inventory::where('material_id', $mat->material_id)->lockForUpdate()->first();
                }

                if ($inv) {
                    $refundQty = (float) $mat->quantity_used;
                    $inv->increment('quantity_on_hand', $refundQty);

                    StockTransaction::create([
                        'material_id'         => $mat->material_id,
                        'material_variant_id' => $mat->material_variant_id,
                        'change_qty'          => $refundQty,
                        'type'                => StockTransaction::TYPE_RESTOCK,
                        'reference_id'        => $assignment->id,
                        'balance_after'       => $inv->fresh()->quantity_on_hand,
                        'note'                => "Stock refunded from cancelled Work Order #{$assignment->assignment_no}",
                        'created_by'          => $userId,
                    ]);
                }
            }

            $assignment->update([
                'status' => 'CANCELLED',
            ]);

            return $assignment;
        });
    }

    /**
     * Atomically wipe all work order assignments, their materials, PDFs, and storage files.
     * Optionally refund raw materials back to inventory.
     *
     * @param bool $refundStock
     * @return array{assignments_deleted: int, materials_cleared: int, pdfs_cleared: int, stock_refunded: bool}
     */
    public function wipeAllAssignments(bool $refundStock = true): array
    {
        return DB::transaction(function () use ($refundStock) {
            $assignmentCount = Assignment::count();
            $materialsCount = AssignmentMaterial::count();
            $pdfsCount = \App\Models\WorkOrderPdf::count();

            if ($refundStock) {
                // Refund deducted stock for any non-cancelled assignments before wiping
                $activeAssignments = Assignment::with('materials')->where('status', '!=', 'CANCELLED')->get();
                foreach ($activeAssignments as $assignment) {
                    foreach ($assignment->materials as $mat) {
                        if (!$mat->material_id) continue;

                        $query = Inventory::where('material_id', $mat->material_id);
                        if ($mat->material_variant_id) {
                            $query->where('material_variant_id', $mat->material_variant_id);
                        }
                        $inv = $query->lockForUpdate()->first() ?: Inventory::where('material_id', $mat->material_id)->lockForUpdate()->first();

                        if ($inv) {
                            $inv->increment('quantity_on_hand', (float) $mat->quantity_used);
                        }
                    }
                }
            }

            // 1. Delete physical PDF files from storage
            try {
                \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('work_orders');
                \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('leather_slips');
                \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('work_orders');
                \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('leather_slips');
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Storage directory wipe warning: " . $e->getMessage());
            }

            // 2. Clean database records
            \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
            \App\Models\WorkOrderPdf::truncate();
            AssignmentMaterial::truncate();

            // Clean assignment-related stock transactions
            StockTransaction::where('note', 'like', '%Work Order%')
                ->orWhere('note', 'like', '%Assignment%')
                ->delete();

            Assignment::truncate();
            \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

            return [
                'assignments_deleted' => $assignmentCount,
                'materials_cleared'   => $materialsCount,
                'pdfs_cleared'        => $pdfsCount,
                'stock_refunded'      => $refundStock,
            ];
        });
    }
}

