<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Unit extends Model
{
    use HasFactory;

    protected $table = 'units';

    protected $fillable = [
        'unit_no',           // e.g. G-101, L1-204, Suite-501
        'floor_id',
        'unit_type',         // 'Retail Shop', 'Office Suite', 'Kiosk'
        'size_sqft',
        'base_rent_bdt',     // Monthly base rent in BDT
        'cam_rate_per_sqft', // Common Area Maintenance rate per sqft in BDT
        'status',            // 'Vacant', 'Occupied', 'Maintenance'
    ];

    protected $casts = [
        'size_sqft' => 'decimal:2',
        'base_rent_bdt' => 'decimal:2',
        'cam_rate_per_sqft' => 'decimal:2',
    ];

    /**
     * Floor where this unit is located.
     */
    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class, 'floor_id');
    }

    /**
     * Historical & current leases for this unit.
     */
    public function leases(): HasMany
    {
        return $this->hasMany(Lease::class, 'unit_id');
    }

    /**
     * Currently active lease for this unit.
     */
    public function activeLease(): HasOne
    {
        return $this->hasOne(Lease::class, 'unit_id')
            ->where('status', 'Active')
            ->latestOfMany();
    }

    /**
     * Utility and rent billing invoices for this unit.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'unit_id');
    }

    /**
     * Maintenance tickets logged for this unit.
     */
    public function maintenanceTickets(): HasMany
    {
        return $this->hasMany(MaintenanceTicket::class, 'unit_id');
    }

    /**
     * Calculate monthly CAM charge in BDT: (size_sqft * cam_rate_per_sqft).
     */
    public function calculateCamCharge(): float
    {
        return round((float) ($this->size_sqft * $this->cam_rate_per_sqft), 2);
    }

    /**
     * Calculate total monthly standard billing estimate (Base Rent + CAM).
     */
    public function calculateMonthlyTotalBdt(): float
    {
        return round((float) ($this->base_rent_bdt + $this->calculateCamCharge()), 2);
    }
}
