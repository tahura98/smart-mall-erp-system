<?php

use App\Http\Controllers\Admin\BillManagementController;
use App\Http\Controllers\Admin\ShopManagementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Owner\OwnerPOSController;
use App\Http\Controllers\Owner\OwnerProductController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Smart Mall API Routes with Laravel Sanctum Authentication
|--------------------------------------------------------------------------
*/

// Public Health Check
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Smart Mall API',
        'auth_driver' => 'sanctum',
        'database' => 'smart_mall_db',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public catalog viewing
Route::get('/shops', [ShopController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);

// --------------------------------------------------------------------------
// 1) Authentication Routes (Login & Logout)
// --------------------------------------------------------------------------
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // --------------------------------------------------------------------------
    // 2) Admin Routes: CRUD for Shops & Generating/Updating Monthly Bills
    // --------------------------------------------------------------------------
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Mall Overview & Analytics
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Admin CRUD for Shops
        Route::apiResource('shops', ShopManagementController::class);

        // Admin Generating & Updating Monthly Bills
        Route::apiResource('bills', BillManagementController::class);
    });

    // --------------------------------------------------------------------------
    // 3) Shop Owner Routes: Manage Own Products & Submit POS Sales (Stock Deduct)
    // --------------------------------------------------------------------------
    Route::prefix('owner')->middleware('role:shop_owner')->group(function () {
        // Manage own products (Catalog & Stock)
        Route::apiResource('products', OwnerProductController::class);

        // POS Sales (Submitting sale automatically deducts product inventory stock)
        Route::get('/sales', [OwnerPOSController::class, 'index']);
        Route::post('/sales/pos', [OwnerPOSController::class, 'store']);
        Route::get('/sales/{sale}', [OwnerPOSController::class, 'show']);
    });
});
