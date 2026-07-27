<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'material_id',
        'label',
        'quantity_used',
        'unit',
    ];

    protected $casts = [
        'quantity_used' => 'decimal:3',
    ];

    public function assignment()
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }
}
