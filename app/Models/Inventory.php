<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $material_id
 * @property float $quantity_on_hand
 * @property string $unit
 * @property Material $material
 */
class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';
    protected $primaryKey = 'material_id';
    public $incrementing = false;

    protected $fillable = [
        'material_id',
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
}
