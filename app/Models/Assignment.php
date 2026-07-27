<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $assignment_no
 * @property int $product_id
 * @property int $labour_id
 * @property int $quantity
 * @property string $status
 * @property \Carbon\Carbon|null $assigned_at
 * @property Product $product
 * @property Labour $labour
 * @property \Illuminate\Database\Eloquent\Collection<int, AssignmentMaterial> $materials
 */
class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_no',
        'product_id',
        'labour_id',
        'quantity',
        'status',
        'assigned_by',
        'assigned_at',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * @return BelongsTo<Labour, $this>
     */
    public function labour(): BelongsTo
    {
        return $this->belongsTo(Labour::class, 'labour_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * @return HasMany<AssignmentMaterial, $this>
     */
    public function materials(): HasMany
    {
        return $this->hasMany(AssignmentMaterial::class, 'assignment_id');
    }

    /**
     * @return HasMany<WorkOrderPdf, $this>
     */
    public function pdfs(): HasMany
    {
        return $this->hasMany(WorkOrderPdf::class, 'assignment_id');
    }
}
