<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransaction extends Model
{
    use HasFactory;

    public const TYPE_ASSIGNMENT_DEDUCTION = 'ASSIGNMENT_DEDUCTION';
    public const TYPE_RESTOCK = 'RESTOCK';
    public const TYPE_MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT';
    public const TYPE_ASSIGNMENT_REVERSAL = 'ASSIGNMENT_REVERSAL';

    public $timestamps = false;

    protected $fillable = [
        'material_id',
        'change_qty',
        'type',
        'reference_id',
        'balance_after',
        'note',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'change_qty' => 'decimal:3',
        'balance_after' => 'decimal:3',
        'created_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Material, $this>
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
