<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $material_id
 * @property string $name
 * @property string|null $sku
 * @property float $reorder_level
 * @property bool $is_active
 * @property Material $material
 * @property Inventory|null $inventory
 */
class MaterialVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'material_id',
        'name',
        'sku',
        'reorder_level',
        'is_active',
    ];

    protected $casts = [
        'reorder_level' => 'decimal:3',
        'is_active' => 'boolean',
    ];

    /**
     * @return BelongsTo<Material, $this>
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    /**
     * @return HasOne<Inventory, $this>
     */
    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class, 'material_variant_id');
    }

    /**
     * @return HasMany<StockTransaction, $this>
     */
    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class, 'material_variant_id');
    }

    /**
     * @return HasMany<ProductMaterial, $this>
     */
    public function productMaterials(): HasMany
    {
        return $this->hasMany(ProductMaterial::class, 'material_variant_id');
    }

    /**
     * @return HasMany<AssignmentMaterial, $this>
     */
    public function assignmentMaterials(): HasMany
    {
        return $this->hasMany(AssignmentMaterial::class, 'material_variant_id');
    }
}
