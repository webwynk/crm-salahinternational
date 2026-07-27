<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    use HasFactory;

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

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
