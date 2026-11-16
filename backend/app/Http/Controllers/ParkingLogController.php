<?php

namespace App\Http\Controllers;

use App\Models\ParkingLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ParkingLogController extends Controller
{
    /**
     * Display a listing of parking records.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ParkingLog::with('operator');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('vehicle_type') && $request->vehicle_type) {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        if ($request->has('basement_zone') && $request->basement_zone) {
            $query->where('basement_zone', $request->basement_zone);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('token_no', 'like', "%{$search}%")
                  ->orWhere('vehicle_reg_no', 'like', "%{$search}%");
            });
        }

        $logs = $query->latest('entry_time')->paginate(25);

        return response()->json([
            'success' => true,
            'parking_logs' => $logs,
        ]);
    }

    /**
     * Record vehicle entry and issue parking token.
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->filled('token_no')) {
            $request->merge([
                'token_no' => 'TOC-PRK-' . date('Ymd') . '-' . strtoupper(Str::random(4)),
            ]);
        }

        $validated = $request->validate([
            'token_no' => 'required|string|max:100|unique:parking_logs,token_no',
            'vehicle_reg_no' => 'required|string|max:100',
            'vehicle_type' => 'required|in:Car,Bike,SUV',
            'basement_zone' => 'required|string|max:100',
            'entry_time' => 'nullable|date',
        ]);

        $log = ParkingLog::create([
            'token_no' => $validated['token_no'],
            'vehicle_reg_no' => $validated['vehicle_reg_no'],
            'vehicle_type' => $validated['vehicle_type'],
            'basement_zone' => $validated['basement_zone'],
            'entry_time' => $validated['entry_time'] ? Carbon::parse($validated['entry_time']) : Carbon::now(),
            'status' => 'Parked',
            'fee_bdt' => 0.00,
            'operator_user_id' => $request->user()?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Token #{$log->token_no} issued for vehicle {$log->vehicle_reg_no}.",
            'parking_log' => $log,
        ], 201);
    }

    /**
     * Calculate current fee before checkout.
     */
    public function calculateFee(int $id): JsonResponse
    {
        $log = ParkingLog::findOrFail($id);

        if ($log->status === 'Exited') {
            return response()->json([
                'success' => true,
                'status' => 'Already Exited',
                'fee_bdt' => $log->fee_bdt,
                'parking_log' => $log,
            ]);
        }

        $now = Carbon::now();
        $fee = ParkingLog::calculateEstimatedFee($log->vehicle_type, $log->entry_time, $now);
        $durationHours = round($log->entry_time->floatDiffInHours($now), 2);

        return response()->json([
            'success' => true,
            'token_no' => $log->token_no,
            'vehicle_reg_no' => $log->vehicle_reg_no,
            'vehicle_type' => $log->vehicle_type,
            'entry_time' => $log->entry_time->toDateTimeString(),
            'current_time' => $now->toDateTimeString(),
            'duration_hours' => $durationHours,
            'estimated_fee_bdt' => $fee,
        ]);
    }

    /**
     * Process vehicle checkout / exit.
     */
    public function checkout(Request $request, int $id): JsonResponse
    {
        $log = ParkingLog::findOrFail($id);

        if ($log->status === 'Exited') {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle has already exited.',
            ], 422);
        }

        $exitTime = $request->filled('exit_time') ? Carbon::parse($request->exit_time) : Carbon::now();
        $fee = ParkingLog::calculateEstimatedFee($log->vehicle_type, $log->entry_time, $exitTime);

        $log->update([
            'exit_time' => $exitTime,
            'fee_bdt' => $fee,
            'status' => 'Exited',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Vehicle {$log->vehicle_reg_no} checked out. Fee collected: ৳{$fee}",
            'parking_log' => $log,
        ]);
    }

    /**
     * Report lost token with penalty fine.
     */
    public function reportLostToken(int $id): JsonResponse
    {
        $log = ParkingLog::findOrFail($id);
        $lostTokenPenalty = 500.00; // Bangladeshi commercial standard lost token fine

        $log->update([
            'exit_time' => Carbon::now(),
            'fee_bdt' => $lostTokenPenalty,
            'status' => 'Lost Token',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Token {$log->token_no} marked as Lost. Fine applied: ৳{$lostTokenPenalty}",
            'parking_log' => $log,
        ]);
    }

    /**
     * Live parking overview for dashboard and gate operators.
     */
    public function liveStatus(): JsonResponse
    {
        $parkedCount = ParkingLog::where('status', 'Parked')->count();

        $byType = ParkingLog::where('status', 'Parked')
            ->selectRaw('vehicle_type, count(*) as count')
            ->groupBy('vehicle_type')
            ->pluck('count', 'vehicle_type');

        $byZone = ParkingLog::where('status', 'Parked')
            ->selectRaw('basement_zone, count(*) as count')
            ->groupBy('basement_zone')
            ->pluck('count', 'basement_zone');

        $todayRevenue = ParkingLog::whereDate('exit_time', Carbon::today())
            ->whereIn('status', ['Exited', 'Lost Token'])
            ->sum('fee_bdt');

        return response()->json([
            'success' => true,
            'currently_parked' => $parkedCount,
            'breakdown_by_type' => $byType,
            'breakdown_by_zone' => $byZone,
            'today_revenue_bdt' => round((float)$todayRevenue, 2),
        ]);
    }
}
