<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'unit_id',
        'lease_id',
        'billing_month',
        'rent_amount',
        'cam_charge',
        'prev_meter_unit',
        'curr_meter_unit',
        'unit_rate',
        'electricity_bill',
        'vat_percentage',
        'vat_amount',
        'total_payable_bdt',
        'payment_method', // Bank Transfer, bKash Corporate, Cash, Cheque
        'transaction_reference',
        'status', // Unpaid, Paid, Overdue
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'rent_amount' => 'decimal:2',
            'cam_charge' => 'decimal:2',
            'prev_meter_unit' => 'decimal:2',
            'curr_meter_unit' => 'decimal:2',
            'unit_rate' => 'decimal:2',
            'electricity_bill' => 'decimal:2',
            'vat_percentage' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'total_payable_bdt' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * The unit billed in this invoice.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * The lease under which this invoice is issued.
     */
    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    /**
     * Scope for unpaid invoices.
     */
    public function scopeUnpaid($query)
    {
        return $query->where('status', 'Unpaid');
    }

    /**
     * Scope for paid invoices.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'Paid');
    }

    /**
     * Scope for overdue invoices.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'Overdue');
    }

    public function isPaid(): bool
    {
        return $this->status === 'Paid';
    }

    public function isOverdue(): bool
    {
        return $this->status === 'Overdue';
    }
}
