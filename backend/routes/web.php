<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Welcome to Smart Mall API',
        'docs' => 'API endpoints available under /api/*',
        'database' => 'smart_mall_db',
    ]);
});
