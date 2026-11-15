<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OwnerProductController extends Controller
{
    /**
     * Helper to get list of shop IDs owned by the authenticated user.
     */
    protected function getOwnerShopIds(Request $request): array
    {
        return $request->user()->shops()->pluck('id')->toArray();
    }

    /**
     * Display a listing of products belonging exclusively to the authenticated shop owner.
     */
    public function index(Request $request): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        if (empty($shopIds)) {
            return response()->json([
                'success' => true,
                'message' => 'No shops currently assigned to your account.',
                'data' => [],
            ]);
        }

        $query = Product::whereIn('shop_id', $shopIds)->with('shop:id,shop_name,shop_number');

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->has('low_stock')) {
            $threshold = (int) $request->query('low_stock', 20);
            $query->where('stock', '<=', $threshold);
        }

        $products = $query->latest('id')->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Shop owner adds a new product to their own shop.
     */
    public function store(Request $request): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        if (empty($shopIds)) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot add products because you have no registered shops.',
            ], 403);
        }

        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', Rule::in($shopIds)],
            'name' => 'required|string|max:191',
            'barcode' => 'required|string|max:191|unique:products,barcode',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        // Default to the first owned shop if not explicitly chosen
        $shopId = $validated['shop_id'] ?? $shopIds[0];

        $product = Product::create([
            'shop_id' => $shopId,
            'name' => $validated['name'],
            'barcode' => $validated['barcode'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product added to your catalog successfully.',
            'data' => $product->load('shop:id,shop_name,shop_number'),
        ], 201);
    }

    /**
     * Display a specific product if owned by this shop owner.
     */
    public function show(Request $request, Product $product): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        if (!in_array($product->shop_id, $shopIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. This product does not belong to your shop.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $product->load('shop:id,shop_name,shop_number'),
        ]);
    }

    /**
     * Update product details or stock count.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        if (!in_array($product->shop_id, $shopIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You cannot modify products from other shops.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:191',
            'barcode' => ['sometimes', 'string', 'max:191', Rule::unique('products', 'barcode')->ignore($product->id)],
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => $product->load('shop:id,shop_name,shop_number'),
        ]);
    }

    /**
     * Remove a product from owner's inventory.
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        if (!in_array($product->shop_id, $shopIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You cannot delete products from other shops.',
            ], 403);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => "Product '{$product->name}' deleted from inventory.",
        ]);
    }
}
