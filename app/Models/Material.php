<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $name
 * @property string $category
 * @property string $base_unit
 * @property float $reorder_level
 * @property bool $is_active
 * @property Inventory|null $inventory
 */
class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'base_unit',
        'reorder_level',
        'is_active',
    ];

    protected $casts = [
        'reorder_level' => 'decimal:3',
        'is_active' => 'boolean',
    ];

    /**
     * @return HasOne<Inventory, $this>
     */
    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class, 'material_id');
    }

    /**
     * @return HasMany<StockTransaction, $this>
     */
    public function stockTransactions(): HasMany
    {
        return $this->hasMany(StockTransaction::class, 'material_id');
    }

    /**
     * @return HasMany<ProductMaterial, $this>
     */
    public function productMaterials(): HasMany
    {
        return $this->hasMany(ProductMaterial::class, 'material_id');
    }
}
