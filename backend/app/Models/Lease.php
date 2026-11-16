<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lease extends Model
{
    use HasFactory;

    protected $fillable = [
        'agreement_no',
        'unit_id',
        'tenant_user_id',
        'company_or_shop_name',
        'proprietor_name',
        'phone_bd',
        'trade_license_no',
        'tin_no',
        'security_deposit_bdt',
        'advance_rent_bdt',
        'start_date',
        'end_date',
        'status', // Active, Terminated, Expired, Draft
    ];

    protected function casts(): array
    {
        return [
            'security_deposit_bdt' => 'decimal:2',
            'advance_rent_bdt' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * The unit associated with this commercial lease.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * The tenant user account associated with this lease.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_user_id');
    }

    /**
     * Invoices generated under this lease agreement.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Scope for active leases.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }
}
