<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LeaseController extends Controller
{
    /**
     * Display a listing of leases.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lease::with(['unit.floor', 'tenant']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('unit_id') && $request->unit_id) {
            $query->where('unit_id', $request->unit_id);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('agreement_no', 'like', "%{$search}%")
                  ->orWhere('company_or_shop_name', 'like', "%{$search}%")
                  ->orWhere('proprietor_name', 'like', "%{$search}%")
                  ->orWhere('phone_bd', 'like', "%{$search}%");
            });
        }

        $leases = $query->latest()->paginate(25);

        return response()->json([
            'success' => true,
            'leases' => $leases,
        ]);
    }

    /**
     * Store a newly created commercial lease agreement.
     */
    public function store(Request $request): JsonResponse
    {
        // Auto-generate agreement number if not provided
        if (!$request->filled('agreement_no')) {
            $request->merge([
                'agreement_no' => 'TOC-LSE-' . date('Y') . '-' . strtoupper(Str::random(5)),
            ]);
        }

        $validated = $request->validate([
            'agreement_no' => 'required|string|max:100|unique:leases,agreement_no',
            'unit_id' => 'required|exists:units,id',
            'tenant_user_id' => 'nullable|exists:users,id',
            'company_or_shop_name' => 'required|string|max:191',
            'proprietor_name' => 'required|string|max:191',
            'phone_bd' => ['required', 'string', 'regex:/^(?:\+8801|01)[3-9]\d{8}$/'],
            'trade_license_no' => 'required|string|max:100',
            'tin_no' => 'required|string|max:100',
            'security_deposit_bdt' => 'required|numeric|min:0',
            'advance_rent_bdt' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'nullable|in:Active,Terminated,Expired,Draft',
        ]);

        $status = $validated['status'] ?? 'Active';

        // Check if unit is already occupied by an active lease
        if ($status === 'Active') {
            $existingActiveLease = Lease::where('unit_id', $validated['unit_id'])
                ->where('status', 'Active')
                ->exists();

            if ($existingActiveLease) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected unit already has an active lease agreement. Please terminate the existing lease before creating a new one.',
                ], 422);
            }
        }

        $lease = Lease::create(array_merge($validated, ['status' => $status]));

        // If active, update unit status to Occupied
        if ($status === 'Active') {
            Unit::where('id', $validated['unit_id'])->update(['status' => 'Occupied']);
        }

        $lease->load(['unit.floor', 'tenant']);

        return response()->json([
            'success' => true,
            'message' => "Lease agreement {$lease->agreement_no} created successfully.",
            'lease' => $lease,
        ], 201);
    }

    /**
     * Display the specified lease agreement with unit and invoice history.
     */
    public function show(int $id): JsonResponse
    {
        $lease = Lease::with(['unit.floor', 'tenant', 'invoices' => function ($q) {
            $q->latest();
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'lease' => $lease,
        ]);
    }

    /**
     * Update the specified lease agreement.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $lease = Lease::findOrFail($id);

        $validated = $request->validate([
            'agreement_no' => [
                'required',
                'string',
                'max:100',
                Rule::unique('leases')->ignore($lease->id),
            ],
            'unit_id' => 'required|exists:units,id',
            'tenant_user_id' => 'nullable|exists:users,id',
            'company_or_shop_name' => 'required|string|max:191',
            'proprietor_name' => 'required|string|max:191',
            'phone_bd' => ['required', 'string', 'regex:/^(?:\+8801|01)[3-9]\d{8}$/'],
            'trade_license_no' => 'required|string|max:100',
            'tin_no' => 'required|string|max:100',
            'security_deposit_bdt' => 'required|numeric|min:0',
            'advance_rent_bdt' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:Active,Terminated,Expired,Draft',
        ]);

        $prevStatus = $lease->status;
        $prevUnitId = $lease->unit_id;

        $lease->update($validated);

        // Handle unit status syncing
        if ($validated['status'] === 'Active') {
            Unit::where('id', $validated['unit_id'])->update(['status' => 'Occupied']);
        } elseif (in_array($validated['status'], ['Terminated', 'Expired'])) {
            // Check if any other active lease exists on that unit
            $hasOtherActive = Lease::where('unit_id', $validated['unit_id'])
                ->where('status', 'Active')
                ->where('id', '!=', $lease->id)
                ->exists();

            if (!$hasOtherActive) {
                Unit::where('id', $validated['unit_id'])->update(['status' => 'Vacant']);
            }
        }

        // If unit changed
        if ($prevUnitId != $validated['unit_id']) {
            $hasOtherOnOldUnit = Lease::where('unit_id', $prevUnitId)
                ->where('status', 'Active')
                ->exists();
            if (!$hasOtherOnOldUnit) {
                Unit::where('id', $prevUnitId)->update(['status' => 'Vacant']);
            }
        }

        $lease->load(['unit.floor', 'tenant']);

        return response()->json([
            'success' => true,
            'message' => "Lease agreement {$lease->agreement_no} updated successfully.",
            'lease' => $lease,
        ]);
    }

    /**
     * Terminate an active lease and free the unit.
     */
    public function terminate(int $id): JsonResponse
    {
        $lease = Lease::findOrFail($id);
        $lease->update(['status' => 'Terminated']);

        // Check if another active lease on this unit exists
        $hasOtherActive = Lease::where('unit_id', $lease->unit_id)
            ->where('status', 'Active')
            ->exists();

        if (!$hasOtherActive) {
            Unit::where('id', $lease->unit_id)->update(['status' => 'Vacant']);
        }

        return response()->json([
            'success' => true,
            'message' => "Lease {$lease->agreement_no} terminated. Unit is now marked Vacant.",
            'lease' => $lease,
        ]);
    }
}
