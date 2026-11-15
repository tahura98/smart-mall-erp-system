<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bill extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bills';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shop_id',
        'month_year',
        'rent_amount',
        'utility_bill',
        'status', // 'paid', 'unpaid', 'pending'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rent_amount' => 'decimal:2',
        'utility_bill' => 'decimal:2',
    ];

    /**
     * Get total amount for this bill (rent + utilities).
     */
    public function getTotalAmountAttribute(): float
    {
        return (float) ($this->rent_amount + $this->utility_bill);
    }

    /**
     * Get the shop that owns the bill.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }
}
