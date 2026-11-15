<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShopManagementController extends Controller
{
    /**
     * Display a listing of all mall shops with owner and KPI relations.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Shop::with(['owner:id,name,email,role'])
            ->withCount(['products', 'bills', 'sales']);

        if ($request->has('floor')) {
            $query->where('floor_name', $request->query('floor'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('shop_name', 'like', "%{$search}%")
                  ->orWhere('shop_number', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Admin creates and registers a new shop.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_number' => 'required|string|max:50|unique:shops,shop_number',
            'floor_name' => 'required|string|max:100',
            'shop_name' => 'required|string|max:191',
            'owner_id' => [
                'required',
                'exists:users,id',
                Rule::exists('users', 'id')->where(function ($q) {
                    $q->where('role', 'shop_owner');
                }),
            ],
            'monthly_rent' => 'required|numeric|min:0',
        ], [
            'owner_id.exists' => 'The selected owner must be an existing user with the shop_owner role.',
        ]);

        $shop = Shop::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shop created successfully.',
            'data' => $shop->load('owner:id,name,email,role'),
        ], 201);
    }

    /**
     * Display detailed information of a specific shop.
     */
    public function show(Shop $shop): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $shop->load(['owner:id,name,email,role', 'bills', 'products', 'sales']),
        ]);
    }

    /**
     * Admin updates shop details.
     */
    public function update(Request $request, Shop $shop): JsonResponse
    {
        $validated = $request->validate([
            'shop_number' => ['sometimes', 'string', 'max:50', Rule::unique('shops', 'shop_number')->ignore($shop->id)],
            'floor_name' => 'sometimes|string|max:100',
            'shop_name' => 'sometimes|string|max:191',
            'owner_id' => [
                'sometimes',
                'exists:users,id',
                Rule::exists('users', 'id')->where(function ($q) {
                    $q->where('role', 'shop_owner');
                }),
            ],
            'monthly_rent' => 'sometimes|numeric|min:0',
        ]);

        $shop->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Shop updated successfully.',
            'data' => $shop->load('owner:id,name,email,role'),
        ]);
    }

    /**
     * Admin deletes a shop.
     */
    public function destroy(Shop $shop): JsonResponse
    {
        $shop->delete();

        return response()->json([
            'success' => true,
            'message' => "Shop '{$shop->shop_name}' deleted successfully.",
        ]);
    }
}
