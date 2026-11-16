<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LeaseController;
use App\Http\Controllers\MaintenanceTicketController;
use App\Http\Controllers\ParkingLogController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Total Office Center (TOC) Commercial ERP - API Routes
| Premier Bangladeshi Commercial Complex & Shopping Mall Management ERP
| Authentication & RBAC powered by Laravel Sanctum
| Roles: super_admin, accounts_officer, tenant, parking_operator
| Currency: Bangladeshi Taka (BDT ৳)
|--------------------------------------------------------------------------
*/

// Public Health Check
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Total Office Center (TOC) Commercial ERP API',
        'version' => '2.0.0-bd',
        'currency' => 'BDT (৳)',
        'auth_driver' => 'sanctum',
        'database' => 'smart_mall_db',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// --------------------------------------------------------------------------
// Authentication (Public)
// --------------------------------------------------------------------------
Route::post('/login', [AuthController::class, 'login']);

// --------------------------------------------------------------------------
// Authenticated Routes (Sanctum Protected)
// --------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Unified ERP Dashboard (adapts by user role)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // User Management
    Route::middleware('role:super_admin,accounts_officer')->group(function () {
        Route::get('/users', [AuthController::class, 'index']);
    });
    Route::middleware('role:super_admin')->group(function () {
        Route::post('/users', [AuthController::class, 'store']);
    });

    // ----------------------------------------------------------------------
    // 1. Floors Management
    // ----------------------------------------------------------------------
    Route::get('/floors', [FloorController::class, 'index']);
    Route::get('/floors/{id}', [FloorController::class, 'show']);

    Route::middleware('role:super_admin')->group(function () {
        Route::post('/floors', [FloorController::class, 'store']);
        Route::put('/floors/{id}', [FloorController::class, 'update']);
        Route::patch('/floors/{id}', [FloorController::class, 'update']);
        Route::delete('/floors/{id}', [FloorController::class, 'destroy']);
    });

    // ----------------------------------------------------------------------
    // 2. Units Management
    // ----------------------------------------------------------------------
    Route::get('/units', [UnitController::class, 'index']);
    Route::get('/units/{id}', [UnitController::class, 'show']);

    Route::middleware('role:super_admin,accounts_officer')->group(function () {
        Route::post('/units', [UnitController::class, 'store']);
        Route::put('/units/{id}', [UnitController::class, 'update']);
        Route::patch('/units/{id}', [UnitController::class, 'update']);
    });
    Route::middleware('role:super_admin')->group(function () {
        Route::delete('/units/{id}', [UnitController::class, 'destroy']);
    });

    // ----------------------------------------------------------------------
    // 3. Commercial Leases Management
    // ----------------------------------------------------------------------
    Route::middleware('role:super_admin,accounts_officer,tenant')->group(function () {
        Route::get('/leases', [LeaseController::class, 'index']);
        Route::get('/leases/{id}', [LeaseController::class, 'show']);
    });

    Route::middleware('role:super_admin,accounts_officer')->group(function () {
        Route::post('/leases', [LeaseController::class, 'store']);
        Route::put('/leases/{id}', [LeaseController::class, 'update']);
        Route::patch('/leases/{id}', [LeaseController::class, 'update']);
        Route::post('/leases/{id}/terminate', [LeaseController::class, 'terminate']);
    });

    // ----------------------------------------------------------------------
    // 4. Commercial Invoices & Billing Management (BDT ৳)
    // ----------------------------------------------------------------------
    Route::middleware('role:super_admin,accounts_officer,tenant')->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    });

    Route::middleware('role:super_admin,accounts_officer')->group(function () {
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::post('/invoices/{id}/payment', [InvoiceController::class, 'recordPayment']);
        Route::post('/invoices/{id}/overdue', [InvoiceController::class, 'markOverdue']);
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']);
    });

    // ----------------------------------------------------------------------
    // 5. Parking Management (Basement Zones & Vehicle Tokens)
    // ----------------------------------------------------------------------
    Route::middleware('role:super_admin,accounts_officer,parking_operator')->group(function () {
        Route::get('/parking/live', [ParkingLogController::class, 'liveStatus']);
        Route::get('/parking/logs', [ParkingLogController::class, 'index']);
    });

    Route::middleware('role:super_admin,parking_operator')->group(function () {
        Route::post('/parking/entry', [ParkingLogController::class, 'store']);
        Route::get('/parking/calculate/{id}', [ParkingLogController::class, 'calculateFee']);
        Route::post('/parking/checkout/{id}', [ParkingLogController::class, 'checkout']);
        Route::post('/parking/lost-token/{id}', [ParkingLogController::class, 'reportLostToken']);
    });

    // ----------------------------------------------------------------------
    // 6. Maintenance Tickets Management (Facility & Central AC)
    // ----------------------------------------------------------------------
    Route::get('/maintenance/tickets', [MaintenanceTicketController::class, 'index']);
    Route::post('/maintenance/tickets', [MaintenanceTicketController::class, 'store']);
    Route::get('/maintenance/tickets/{id}', [MaintenanceTicketController::class, 'show']);

    Route::middleware('role:super_admin,accounts_officer')->group(function () {
        Route::patch('/maintenance/tickets/{id}/status', [MaintenanceTicketController::class, 'updateStatus']);
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::delete('/maintenance/tickets/{id}', [MaintenanceTicketController::class, 'destroy']);
    });
});
