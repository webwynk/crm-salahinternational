<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'material_id',
        'material_variant_id',
        'label',
        'quantity_used',
        'unit',
    ];

    protected $casts = [
        'quantity_used' => 'decimal:3',
    ];

    /**
     * @return BelongsTo<Assignment, $this>
     */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
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
}
