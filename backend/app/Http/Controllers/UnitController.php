<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UnitController extends Controller
{
    /**
     * Display a listing of units with filters and financial calculations.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Unit::with(['floor', 'activeLease']);

        if ($request->has('floor_id') && $request->floor_id) {
            $query->where('floor_id', $request->floor_id);
        }

        if ($request->has('unit_type') && $request->unit_type) {
            $query->where('unit_type', $request->unit_type);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $query->where('unit_no', 'like', "%{$request->search}%");
        }

        $units = $query->latest()->paginate(25);

        // Append financial helper calculations to collection
        $units->getCollection()->transform(function ($unit) {
            $unit->calculated_cam_bdt = $unit->calculateCamCharge();
            $unit->estimated_monthly_total_bdt = $unit->calculateMonthlyTotalBdt();
            return $unit;
        });

        return response()->json([
            'success' => true,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unit_no' => 'required|string|max:50|unique:units,unit_no',
            'floor_id' => 'required|exists:floors,id',
            'unit_type' => 'required|in:Retail Shop,Office Suite,Kiosk',
            'size_sqft' => 'required|numeric|min:1',
            'base_rent_bdt' => 'required|numeric|min:0',
            'cam_rate_per_sqft' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:Vacant,Occupied,Maintenance',
        ]);

        $unit = Unit::create([
            'unit_no' => $validated['unit_no'],
            'floor_id' => $validated['floor_id'],
            'unit_type' => $validated['unit_type'],
            'size_sqft' => $validated['size_sqft'],
            'base_rent_bdt' => $validated['base_rent_bdt'],
            'cam_rate_per_sqft' => $validated['cam_rate_per_sqft'] ?? 15.00,
            'status' => $validated['status'] ?? 'Vacant',
        ]);

        $unit->load('floor');
        $unit->calculated_cam_bdt = $unit->calculateCamCharge();
        $unit->estimated_monthly_total_bdt = $unit->calculateMonthlyTotalBdt();

        return response()->json([
            'success' => true,
            'message' => "Unit '{$unit->unit_no}' registered successfully.",
            'unit' => $unit,
        ], 201);
    }

    /**
     * Display the specified unit.
     */
    public function show(int $id): JsonResponse
    {
        $unit = Unit::with(['floor', 'activeLease.tenant', 'invoices' => function ($q) {
            $q->latest()->limit(10);
        }, 'maintenanceTickets' => function ($q) {
            $q->latest()->limit(5);
        }])->findOrFail($id);

        $unit->calculated_cam_bdt = $unit->calculateCamCharge();
        $unit->estimated_monthly_total_bdt = $unit->calculateMonthlyTotalBdt();

        return response()->json([
            'success' => true,
            'unit' => $unit,
        ]);
    }

    /**
     * Update the specified unit in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $unit = Unit::findOrFail($id);

        $validated = $request->validate([
            'unit_no' => [
                'required',
                'string',
                'max:50',
                Rule::unique('units')->ignore($unit->id),
            ],
            'floor_id' => 'required|exists:floors,id',
            'unit_type' => 'required|in:Retail Shop,Office Suite,Kiosk',
            'size_sqft' => 'required|numeric|min:1',
            'base_rent_bdt' => 'required|numeric|min:0',
            'cam_rate_per_sqft' => 'required|numeric|min:0',
            'status' => 'required|in:Vacant,Occupied,Maintenance',
        ]);

        $unit->update($validated);
        $unit->load('floor');
        $unit->calculated_cam_bdt = $unit->calculateCamCharge();
        $unit->estimated_monthly_total_bdt = $unit->calculateMonthlyTotalBdt();

        return response()->json([
            'success' => true,
            'message' => "Unit '{$unit->unit_no}' updated successfully.",
            'unit' => $unit,
        ]);
    }

    /**
     * Remove the specified unit.
     */
    public function destroy(int $id): JsonResponse
    {
        $unit = Unit::with('activeLease')->findOrFail($id);

        if ($unit->activeLease) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete unit '{$unit->unit_no}' because it has an active lease agreement ({$unit->activeLease->agreement_no}). Please terminate the lease first.",
            ], 422);
        }

        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => "Unit '{$unit->unit_no}' deleted successfully.",
        ]);
    }
}
