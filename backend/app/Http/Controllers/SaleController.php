<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    /**
     * Display a listing of sales.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Sale::with('shop');

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->query('shop_id'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->get(),
        ]);
    }

    /**
     * Store a new sale.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'total_amount' => 'required|numeric|min:0',
            'invoice_number' => 'required|string|max:191|unique:sales,invoice_number',
        ]);

        $sale = Sale::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Sale recorded successfully',
            'data' => $sale->load('shop'),
        ], 201);
    }
}
