<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $leather_challan_id
 * @property int $product_id
 * @property int $quantity
 * @property float $leather_sqft_per_pc
 * @property float $total_sqft
 * @property LeatherChallan $challan
 * @property Product $product
 */
class LeatherChallanItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'leather_challan_id',
        'product_id',
        'quantity',
        'leather_sqft_per_pc',
        'total_sqft',
    ];

    protected $casts = [
        'quantity'            => 'integer',
        'leather_sqft_per_pc' => 'decimal:2',
        'total_sqft'          => 'decimal:2',
    ];

    /**
     * @return BelongsTo<LeatherChallan, $this>
     */
    public function challan(): BelongsTo
    {
        return $this->belongsTo(LeatherChallan::class, 'leather_challan_id');
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
