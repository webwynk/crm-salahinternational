<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $material_id
 * @property int|null $material_variant_id
 * @property float $quantity_on_hand
 * @property string $unit
 * @property Material $material
 * @property MaterialVariant|null $variant
 */
class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'material_id',
        'material_variant_id',
        'quantity_on_hand',
        'unit',
    ];

    protected $casts = [
        'quantity_on_hand' => 'decimal:3',
    ];

    /**
     * @return BelongsTo<Material, $this>
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    /**
     * @return BelongsTo<MaterialVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(MaterialVariant::class, 'material_variant_id');
    }
}
