<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParkingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'token_no',
        'vehicle_reg_no',
        'vehicle_type', // Car, Bike, SUV
        'basement_zone',
        'entry_time',
        'exit_time',
        'fee_bdt',
        'status', // Parked, Exited, Lost Token
        'operator_user_id',
    ];

    protected function casts(): array
    {
        return [
            'entry_time' => 'datetime',
            'exit_time' => 'datetime',
            'fee_bdt' => 'decimal:2',
        ];
    }

    /**
     * Operator user who handled the entry/exit.
     */
    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_user_id');
    }

    /**
     * Calculate parking fee based on vehicle type and duration (Bangladeshi commercial standard rates).
     */
    public static function calculateEstimatedFee(string $vehicleType, Carbon $entryTime, ?Carbon $exitTime = null): float
    {
        $exitTime = $exitTime ?? Carbon::now();
        $hours = max(1, (int) ceil($entryTime->floatDiffInHours($exitTime)));

        return match ($vehicleType) {
            'Bike' => 30 + max(0, $hours - 2) * 10,
            'SUV'  => 120 + max(0, $hours - 2) * 60,
            default => 100 + max(0, $hours - 2) * 50, // Car
        };
    }

    /**
     * Scope for currently parked vehicles.
     */
    public function scopeParked($query)
    {
        return $query->where('status', 'Parked');
    }
}
