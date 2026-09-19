<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $phone
 * @property string|null $address
 * @property bool $is_active
 * @property string|null $notes
 * @property \Illuminate\Database\Eloquent\Collection<int, LeatherChallan> $challans
 */
class Cutter extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'address',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * @return HasMany<LeatherChallan, $this>
     */
    public function challans(): HasMany
    {
        return $this->hasMany(LeatherChallan::class, 'cutter_id');
    }
}
