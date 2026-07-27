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
 * @property array<string>|null $skill_tags
 * @property bool $is_active
 */
class Labour extends Model
{
    use HasFactory;

    protected $table = 'labour';

    protected $fillable = [
        'name',
        'phone',
        'address',
        'skill_tags',
        'is_active',
    ];

    protected $casts = [
        'skill_tags' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * @return HasMany<Assignment, $this>
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'labour_id');
    }
}
