---
name: database-laravel
description: Database schema, MySQL migrations, Eloquent models, relationships, AssignmentService stock-deduction transaction with FOR UPDATE row locking, and seeders.
---

# Database Skill (Laravel Edition) — MySQL + Eloquent

## Schema Tables & Migrations
1. `materials`: `id`, `name`, `category` (LEATHER|THREAD|GLUE|HARDWARE|LINING|OTHER), `base_unit` (cm2|m|g|pcs), `reorder_level`, `is_active`.
2. `products`: `id`, `code` (unique, fulltext index), `name`, `category`, `description`, `image_url`, `is_active`, `created_by`.
3. `product_materials` (BOM): `id`, `product_id`, `material_id`, `material_type` (CONSUMABLE|HARDWARE|PROCESS_NOTE), `label`, `quantity_min`, `quantity_max`, `unit`, `dimension_note`, `sort_order`.
4. `inventory`: `material_id` (primary), `quantity_on_hand`, `unit`.
5. `stock_transactions`: `id`, `material_id`, `change_qty`, `type` (ASSIGNMENT_DEDUCTION|RESTOCK|MANUAL_ADJUSTMENT|ASSIGNMENT_REVERSAL), `reference_id`, `balance_after`, `note`, `created_by`, `created_at`.
6. `labour`: `id`, `name`, `phone`, `address`, `skill_tags`, `is_active`.
7. `assignments`: `id`, `assignment_no` (unique), `product_id`, `labour_id`, `quantity`, `status` (ASSIGNED|IN_PROGRESS|COMPLETED|CANCELLED), `assigned_by`, `assigned_at`, `completed_at`, `notes`.
8. `assignment_materials`: `id`, `assignment_id`, `material_id`, `label`, `quantity_used`, `unit`.
9. `work_order_pdfs`: `id`, `assignment_id`, `file_path`, `generated_by`, `generated_at`.

---

## Stock Deduction Logic (`AssignmentService.php`)

Deduction quantity is calculated using worst-case (max) quantity: `quantity_max ?? quantity_min`.

```php
namespace App\Services;

use App\Models\{Product, Assignment, AssignmentMaterial, Inventory, StockTransaction};
use App\Exceptions\InsufficientStockException;
use Illuminate\Support\Facades\DB;

class AssignmentService
{
    public function createAssignment(string $productId, string $labourId, int $quantity, int $assignedByUserId): Assignment
    {
        return DB::transaction(function () use ($productId, $labourId, $quantity, $assignedByUserId) {
            $product = Product::with('materials')->findOrFail($productId);
            $bom = $product->materials->where('material_type', 'CONSUMABLE');

            // Lock inventory rows FOR UPDATE to prevent race conditions under high concurrency
            $lockedInventory = [];
            foreach ($bom as $item) {
                if (!$item->material_id) continue;
                $needed = $item->deductionQty() * $quantity;

                $inv = Inventory::where('material_id', $item->material_id)->lockForUpdate()->first();

                if (!$inv || $inv->quantity_on_hand < $needed) {
                    throw new InsufficientStockException(
                        "Not enough {$item->label} in stock ({$inv?->quantity_on_hand} {$item->unit} available, {$needed} {$item->unit} needed)."
                    );
                }
                $lockedInventory[$item->material_id] = ['needed' => $needed, 'item' => $item];
            }

            $assignment = Assignment::create([
                'assignment_no' => $this->nextAssignmentNo(),
                'product_id'    => $productId,
                'labour_id'     => $labourId,
                'quantity'      => $quantity,
                'assigned_by'   => $assignedByUserId,
                'status'        => 'ASSIGNED',
            ]);

            foreach ($lockedInventory as $materialId => $data) {
                AssignmentMaterial::create([
                    'assignment_id' => $assignment->id,
                    'material_id'   => $materialId,
                    'label'         => $data['item']->label,
                    'quantity_used' => $data['needed'],
                    'unit'          => $data['item']->unit,
                ]);

                $inv = Inventory::where('material_id', $materialId)->lockForUpdate()->first();
                $inv->decrement('quantity_on_hand', $data['needed']);

                StockTransaction::create([
                    'material_id'   => $materialId,
                    'change_qty'    => -$data['needed'],
                    'type'          => 'ASSIGNMENT_DEDUCTION',
                    'reference_id'  => $assignment->id,
                    'balance_after' => $inv->fresh()->quantity_on_hand,
                    'created_by'    => $assignedByUserId,
                ]);
            }

            return $assignment;
        });
    }

    private function nextAssignmentNo(): string
    {
        $year = now()->year;
        $count = Assignment::whereYear('created_at', $year)->count() + 1;
        return sprintf('WO-%d-%04d', $year, $count);
    }
}
```
