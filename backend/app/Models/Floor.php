<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Floor extends Model
{
    use HasFactory;

    protected $table = 'floors';

    protected $fillable = [
        'level_name',  // e.g. Ground Floor, Level 1, Level 2, Basement 1
        'zone_type',   // e.g. Shopping Mall / Food Court / Corporate Office
        'block_code',  // e.g. Block A, Block B, North Wing
        'description',
    ];

    /**
     * Units situated on this floor.
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class, 'floor_id');
    }

    /**
     * Active commercial leases across this floor.
     */
    public function leases(): HasManyThrough
    {
        return $this->hasManyThrough(Lease::class, Unit::class, 'floor_id', 'unit_id');
    }

    /**
     * Invoices generated across this floor.
     */
    public function invoices(): HasManyThrough
    {
        return $this->hasManyThrough(Invoice::class, Unit::class, 'floor_id', 'unit_id');
    }
}
