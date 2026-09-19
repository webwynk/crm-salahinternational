<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $challan_no
 * @property int $cutter_id
 * @property int $material_id
 * @property int|null $material_variant_id
 * @property float $total_sqft
 * @property string|null $notes
 * @property string $status
 * @property string|null $pdf_path
 * @property int|null $created_by
 * @property Cutter $cutter
 * @property Material $material
 * @property MaterialVariant|null $variant
 * @property User|null $creator
 * @property \Illuminate\Database\Eloquent\Collection<int, LeatherChallanItem> $items
 */
class LeatherChallan extends Model
{
    use HasFactory;

    public const STATUS_ISSUED = 'ISSUED';
    public const STATUS_CANCELLED = 'CANCELLED';

    protected $fillable = [
        'challan_no',
        'cutter_id',
        'material_id',
        'material_variant_id',
        'total_sqft',
        'notes',
        'status',
        'pdf_path',
        'created_by',
    ];

    protected $casts = [
        'total_sqft' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<Cutter, $this>
     */
    public function cutter(): BelongsTo
    {
        return $this->belongsTo(Cutter::class, 'cutter_id');
    }

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

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<LeatherChallanItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(LeatherChallanItem::class, 'leather_challan_id');
    }
}
