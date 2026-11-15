<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get aggregate dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        $totalShops = Shop::count();
        $totalShopOwners = User::where('role', 'shop_owner')->count();
        $totalProducts = Product::count();
        $totalStock = Product::sum('stock');
        $totalRevenue = Sale::sum('total_amount');
        $pendingBillsCount = Bill::where('status', 'pending')->count();
        $unpaidBillsCount = Bill::where('status', 'unpaid')->count();
        $paidBillsTotal = Bill::where('status', 'paid')->sum('rent_amount') + Bill::where('status', 'paid')->sum('utility_bill');

        return response()->json([
            'success' => true,
            'data' => [
                'total_shops' => $totalShops,
                'total_shop_owners' => $totalShopOwners,
                'total_products' => $totalProducts,
                'total_stock' => $totalStock,
                'total_revenue' => (float) $totalRevenue,
                'pending_bills_count' => $pendingBillsCount,
                'unpaid_bills_count' => $unpaidBillsCount,
                'collected_rent_utilities' => (float) $paidBillsTotal,
            ],
        ]);
    }
}
