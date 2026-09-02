<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
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
 * @property Collection<int, MaterialVariant> $variants
 * @property Collection<int, Inventory> $inventories
 */
class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'base_unit',
        'is_leather',
        'reorder_level',
        'is_active',
    ];

    protected $casts = [
        'reorder_level' => 'decimal:3',
        'is_leather'    => 'boolean',
        'is_active'     => 'boolean',
    ];

    /**
     * Scope query to only leather items.
     */
    public function scopeLeather($query)
    {
        return $query->where('is_leather', true);
    }

    /**
     * Scope query to only non-leather materials.
     */
    public function scopeMaterialsOnly($query)
    {
        return $query->where('is_leather', false);
    }

    /**
     * @return HasMany<MaterialVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(MaterialVariant::class, 'material_id');
    }

    /**
     * @return HasOne<Inventory, $this>
     */
    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class, 'material_id');
    }

    /**
     * @return HasMany<Inventory, $this>
     */
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class, 'material_id');
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

    /**
     * @return HasMany<AssignmentMaterial, $this>
     */
    public function assignmentMaterials(): HasMany
    {
        return $this->hasMany(AssignmentMaterial::class, 'material_id');
    }
}
