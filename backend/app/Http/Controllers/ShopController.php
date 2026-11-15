<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * Display a listing of shops with owner, bills, and products.
     */
    public function index(): JsonResponse
    {
        $shops = Shop::with(['owner', 'bills', 'products'])->get();
        return response()->json([
            'success' => true,
            'data' => $shops,
        ]);
    }

    /**
     * Store a newly created shop.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_number' => 'required|string|max:191',
            'floor_name' => 'required|string|max:191',
            'shop_name' => 'required|string|max:191',
            'owner_id' => 'required|exists:users,id',
            'monthly_rent' => 'required|numeric|min:0',
        ]);

        $shop = Shop::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shop registered successfully',
            'data' => $shop->load('owner'),
        ], 201);
    }

    /**
     * Display the specified shop.
     */
    public function show(Shop $shop): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $shop->load(['owner', 'bills', 'products', 'sales']),
        ]);
    }

    /**
     * Update the specified shop.
     */
    public function update(Request $request, Shop $shop): JsonResponse
    {
        $validated = $request->validate([
            'shop_number' => 'sometimes|string|max:191',
            'floor_name' => 'sometimes|string|max:191',
            'shop_name' => 'sometimes|string|max:191',
            'owner_id' => 'sometimes|exists:users,id',
            'monthly_rent' => 'sometimes|numeric|min:0',
        ]);

        $shop->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shop updated successfully',
            'data' => $shop->load('owner'),
        ]);
    }

    /**
     * Remove the specified shop.
     */
    public function destroy(Shop $shop): JsonResponse
    {
        $shop->delete();

        return response()->json([
            'success' => true,
            'message' => 'Shop deleted successfully',
        ]);
    }
}
