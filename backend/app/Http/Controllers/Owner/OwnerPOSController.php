<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OwnerPOSController extends Controller
{
    /**
     * Helper to get shop IDs owned by the authenticated user.
     */
    protected function getOwnerShopIds(Request $request): array
    {
        return $request->user()->shops()->pluck('id')->toArray();
    }

    /**
     * Display a listing of sales transactions for the authenticated shop owner.
     */
    public function index(Request $request): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        $sales = Sale::whereIn('shop_id', $shopIds)
            ->with(['shop:id,shop_name,shop_number', 'items.product:id,name,barcode'])
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sales,
        ]);
    }

    /**
     * Submit a POS Sale transaction:
     * - Verifies shop ownership
     * - Validates product availability and stock
     * - Atomically deducts product stock
     * - Creates sale and line-item records
     */
    public function store(Request $request): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        if (empty($shopIds)) {
            return response()->json([
                'success' => false,
                'message' => 'No active shops associated with your account.',
            ], 403);
        }

        $validated = $request->validate([
            'shop_id' => ['nullable', 'integer', Rule::in($shopIds)],
            'invoice_number' => 'nullable|string|max:100|unique:sales,invoice_number',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer',
            'items.*.barcode' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $targetShopId = $validated['shop_id'] ?? $shopIds[0];
        $shop = Shop::findOrFail($targetShopId);

        // Execute sale and stock deduction inside a database transaction
        $sale = DB::transaction(function () use ($validated, $shop, $request) {
            $totalAmount = 0;
            $saleLines = [];
            $stockDeductionSummary = [];

            // Generate clean unique invoice number if not provided
            $invoiceNumber = $validated['invoice_number'] ?? (
                'INV-' . date('Ymd') . '-' . strtoupper(Str::random(5))
            );

            foreach ($validated['items'] as $index => $itemData) {
                $qty = (int) $itemData['quantity'];

                // Query product by id or barcode belonging to this shop with row lock
                $productQuery = Product::where('shop_id', $shop->id)->lockForUpdate();

                if (!empty($itemData['product_id'])) {
                    $product = $productQuery->where('id', $itemData['product_id'])->first();
                } elseif (!empty($itemData['barcode'])) {
                    $product = $productQuery->where('barcode', $itemData['barcode'])->first();
                } else {
                    throw ValidationException::withMessages([
                        "items.{$index}" => ['Each item must specify either product_id or barcode.'],
                    ]);
                }

                if (!$product) {
                    throw ValidationException::withMessages([
                        "items.{$index}" => ["Product not found in {$shop->shop_name} catalog."],
                    ]);
                }

                // Verify sufficient stock before deducting
                if ($product->stock < $qty) {
                    throw ValidationException::withMessages([
                        "items.{$index}" => [
                            "Insufficient stock for '{$product->name}'. Available: {$product->stock}, Requested: {$qty}."
                        ],
                    ]);
                }

                // Automatically deduct product stock
                $product->decrement('stock', $qty);
                $remainingStock = $product->fresh()->stock;

                $unitPrice = (float) $product->price;
                $subtotal = round($unitPrice * $qty, 2);
                $totalAmount += $subtotal;

                $saleLines[] = [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];

                $stockDeductionSummary[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'barcode' => $product->barcode,
                    'quantity_deducted' => $qty,
                    'remaining_stock' => $remainingStock,
                ];
            }

            // Create Master Sale record
            $sale = Sale::create([
                'shop_id' => $shop->id,
                'total_amount' => $totalAmount,
                'invoice_number' => $invoiceNumber,
            ]);

            // Save line items
            foreach ($saleLines as $line) {
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $line['product_id'],
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'subtotal' => $line['subtotal'],
                ]);
            }

            return [
                'sale' => $sale->load(['shop:id,shop_name,shop_number', 'items.product:id,name,barcode,price']),
                'stock_deductions' => $stockDeductionSummary,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'POS Sale recorded successfully. Product inventory updated.',
            'data' => $sale['sale'],
            'inventory_updates' => $sale['stock_deductions'],
        ], 201);
    }

    /**
     * Display single invoice details.
     */
    public function show(Request $request, Sale $sale): JsonResponse
    {
        $shopIds = $this->getOwnerShopIds($request);

        if (!in_array($sale->shop_id, $shopIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. This sale does not belong to your shop.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $sale->load(['shop:id,shop_name,shop_number', 'items.product:id,name,barcode,price']),
        ]);
    }
}
