<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BillManagementController extends Controller
{
    /**
     * Display a listing of bills across all shops with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Bill::with(['shop.owner:id,name,email']);

        if ($request->has('status') && in_array($request->query('status'), ['paid', 'unpaid', 'pending'])) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->query('shop_id'));
        }

        if ($request->has('month_year')) {
            $query->where('month_year', $request->query('month_year'));
        }

        $bills = $query->latest('id')->get();

        return response()->json([
            'success' => true,
            'data' => $bills,
        ]);
    }

    /**
     * Admin generates a monthly bill for a shop.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'month_year' => [
                'required',
                'string',
                'max:50',
                Rule::unique('bills')->where(function ($query) use ($request) {
                    return $query->where('shop_id', $request->shop_id)
                                 ->where('month_year', $request->month_year);
                }),
            ],
            'rent_amount' => 'nullable|numeric|min:0',
            'utility_bill' => 'required|numeric|min:0',
            'status' => 'nullable|in:paid,unpaid,pending',
        ], [
            'month_year.unique' => 'A bill has already been generated for this shop for the specified period.',
        ]);

        $shop = Shop::findOrFail($validated['shop_id']);

        // Default rent amount to contractual monthly_rent if not specified
        $rentAmount = isset($validated['rent_amount']) && $validated['rent_amount'] !== '' 
            ? $validated['rent_amount'] 
            : $shop->monthly_rent;

        $bill = Bill::create([
            'shop_id' => $shop->id,
            'month_year' => $validated['month_year'],
            'rent_amount' => $rentAmount,
            'utility_bill' => $validated['utility_bill'],
            'status' => $validated['status'] ?? 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Monthly bill generated successfully.',
            'data' => $bill->load('shop.owner:id,name,email'),
        ], 201);
    }

    /**
     * Display a single bill.
     */
    public function show(Bill $bill): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $bill->load('shop.owner:id,name,email'),
        ]);
    }

    /**
     * Admin updates a monthly bill (rent amount, utility bill, or status).
     */
    public function update(Request $request, Bill $bill): JsonResponse
    {
        $validated = $request->validate([
            'rent_amount' => 'sometimes|numeric|min:0',
            'utility_bill' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:paid,unpaid,pending',
            'month_year' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('bills')->ignore($bill->id)->where(function ($query) use ($bill, $request) {
                    $shopId = $request->shop_id ?? $bill->shop_id;
                    $monthYear = $request->month_year ?? $bill->month_year;
                    return $query->where('shop_id', $shopId)->where('month_year', $monthYear);
                }),
            ],
        ]);

        $bill->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Bill updated successfully.',
            'data' => $bill->load('shop.owner:id,name,email'),
        ]);
    }

    /**
     * Admin deletes a bill.
     */
    public function destroy(Bill $bill): JsonResponse
    {
        $bill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bill record deleted successfully.',
        ]);
    }
}
