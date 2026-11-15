<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shop extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'shops';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'shop_number',
        'floor_name',
        'shop_name',
        'owner_id',
        'monthly_rent',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'monthly_rent' => 'decimal:2',
    ];

    /**
     * Get the owner (User) of the shop.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all bills for this shop.
     */
    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class, 'shop_id');
    }

    /**
     * Get all products for this shop.
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'shop_id');
    }

    /**
     * Get all sales recorded for this shop.
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'shop_id');
    }
}
