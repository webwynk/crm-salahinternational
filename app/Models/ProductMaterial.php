<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property int|null $material_id
 * @property string $material_type
 * @property string $label
 * @property float|null $quantity_min
 * @property float|null $quantity_max
 * @property string|null $unit
 * @property string|null $dimension_note
 * @property int $sort_order
 * @property Material|null $material
 */
class ProductMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'material_id',
        'material_type',
        'label',
        'quantity_min',
        'quantity_max',
        'unit',
        'dimension_note',
        'sort_order',
    ];

    protected $casts = [
        'quantity_min' => 'decimal:3',
        'quantity_max' => 'decimal:3',
        'sort_order' => 'integer',
    ];

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * @return BelongsTo<Material, $this>
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    /**
     * Deduct using worst-case (max) quantity per skill requirement.
     */
    public function deductionQty(): float
    {
        return (float) ($this->quantity_max ?? $this->quantity_min ?? 0);
    }
}
