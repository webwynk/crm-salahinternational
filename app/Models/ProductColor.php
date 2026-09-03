<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $product_id
 * @property string $color_name
 * @property string|null $image_url
 * @property int $sort_order
 * @property bool $is_active
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property Product $product
 * @property \Illuminate\Database\Eloquent\Collection<int, ProductMaterial> $materials
 * @property \Illuminate\Database\Eloquent\Collection<int, Assignment> $assignments
 */
class ProductColor extends Model
{
    use HasFactory;

    protected $table = 'product_colors';

    protected $fillable = [
        'product_id',
        'color_name',
        'image_url',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Dedicated BOM materials for this color variation.
     *
     * @return HasMany<ProductMaterial, $this>
     */
    public function materials(): HasMany
    {
        return $this->hasMany(ProductMaterial::class, 'product_color_id')->orderBy('sort_order', 'asc');
    }

    /**
     * Work order assignments produced in this color variation.
     *
     * @return HasMany<Assignment, $this>
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'product_color_id');
    }
}
