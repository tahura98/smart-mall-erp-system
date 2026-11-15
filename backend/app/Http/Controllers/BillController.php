<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillController extends Controller
{
    /**
     * Display a listing of bills with shop details.
     */
    public function index(): JsonResponse
    {
        $bills = Bill::with(['shop.owner'])->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $bills,
        ]);
    }

    /**
     * Store a newly created bill.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'month_year' => 'required|string|max:191',
            'rent_amount' => 'required|numeric|min:0',
            'utility_bill' => 'required|numeric|min:0',
            'status' => 'required|in:paid,unpaid,pending',
        ]);

        $bill = Bill::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Bill generated successfully',
            'data' => $bill->load('shop'),
        ], 201);
    }

    /**
     * Update bill status or details.
     */
    public function update(Request $request, Bill $bill): JsonResponse
    {
        $validated = $request->validate([
            'rent_amount' => 'sometimes|numeric|min:0',
            'utility_bill' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:paid,unpaid,pending',
        ]);

        $bill->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Bill updated successfully',
            'data' => $bill->load('shop'),
        ]);
    }
}
