<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Unit;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices with summaries.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Invoice::with(['unit.floor', 'lease.tenant']);

        // If user is a tenant, restrict to only their unit's invoices
        if ($user && $user->role === 'tenant') {
            $query->whereHas('lease', function ($q) use ($user) {
                $q->where('tenant_user_id', $user->id);
            });
        }

        if ($request->has('billing_month') && $request->billing_month) {
            $query->where('billing_month', $request->billing_month);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('unit_id') && $request->unit_id) {
            $query->where('unit_id', $request->unit_id);
        }

        if ($request->has('search') && $request->search) {
            $query->where('invoice_no', 'like', "%{$request->search}%");
        }

        // Summary totals across all matching invoices
        $summaryQuery = clone $query;
        $totalBilled = (clone $summaryQuery)->sum('total_payable_bdt');
        $totalCollected = (clone $summaryQuery)->where('status', 'Paid')->sum('total_payable_bdt');
        $totalUnpaid = (clone $summaryQuery)->where('status', 'Unpaid')->sum('total_payable_bdt');
        $totalOverdue = (clone $summaryQuery)->where('status', 'Overdue')->sum('total_payable_bdt');

        $invoices = $query->latest()->paginate(25);

        return response()->json([
            'success' => true,
            'summary' => [
                'total_billed_bdt' => round((float)$totalBilled, 2),
                'total_collected_bdt' => round((float)$totalCollected, 2),
                'total_unpaid_bdt' => round((float)$totalUnpaid, 2),
                'total_overdue_bdt' => round((float)$totalOverdue, 2),
            ],
            'invoices' => $invoices,
        ]);
    }

    /**
     * Store a newly generated commercial monthly invoice.
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->filled('invoice_no')) {
            $request->merge([
                'invoice_no' => 'TOC-INV-' . date('Ym') . '-' . strtoupper(Str::random(5)),
            ]);
        }

        $validated = $request->validate([
            'invoice_no' => 'required|string|max:100|unique:invoices,invoice_no',
            'unit_id' => 'required|exists:units,id',
            'lease_id' => 'nullable|exists:leases,id',
            'billing_month' => 'required|string|max:50',
            'rent_amount' => 'nullable|numeric|min:0',
            'cam_charge' => 'nullable|numeric|min:0',
            'prev_meter_unit' => 'required|numeric|min:0',
            'curr_meter_unit' => 'required|numeric|gte:prev_meter_unit',
            'unit_rate' => 'nullable|numeric|min:0',
            'vat_percentage' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:Unpaid,Paid,Overdue',
        ]);

        $unit = Unit::with('activeLease')->findOrFail($validated['unit_id']);

        // Determine rent and CAM amounts
        $rentAmount = isset($validated['rent_amount']) ? (float)$validated['rent_amount'] : (float)$unit->base_rent_bdt;
        $camCharge = isset($validated['cam_charge']) ? (float)$validated['cam_charge'] : $unit->calculateCamCharge();
        $leaseId = $validated['lease_id'] ?? ($unit->activeLease ? $unit->activeLease->id : null);

        // Electricity calculation
        $prevMeter = (float)$validated['prev_meter_unit'];
        $currMeter = (float)$validated['curr_meter_unit'];
        $unitRate = isset($validated['unit_rate']) ? (float)$validated['unit_rate'] : 12.50;
        $electricityBill = round(($currMeter - $prevMeter) * $unitRate, 2);

        // VAT calculation
        $vatPct = isset($validated['vat_percentage']) ? (float)$validated['vat_percentage'] : 5.00;
        $subtotal = $rentAmount + $camCharge + $electricityBill;
        $vatAmount = round($subtotal * ($vatPct / 100), 2);

        // Total payable in BDT
        $totalPayable = round($subtotal + $vatAmount, 2);

        $invoice = Invoice::create([
            'invoice_no' => $validated['invoice_no'],
            'unit_id' => $unit->id,
            'lease_id' => $leaseId,
            'billing_month' => $validated['billing_month'],
            'rent_amount' => $rentAmount,
            'cam_charge' => $camCharge,
            'prev_meter_unit' => $prevMeter,
            'curr_meter_unit' => $currMeter,
            'unit_rate' => $unitRate,
            'electricity_bill' => $electricityBill,
            'vat_percentage' => $vatPct,
            'vat_amount' => $vatAmount,
            'total_payable_bdt' => $totalPayable,
            'status' => $validated['status'] ?? 'Unpaid',
        ]);

        $invoice->load(['unit.floor', 'lease.tenant']);

        return response()->json([
            'success' => true,
            'message' => "Invoice {$invoice->invoice_no} generated successfully.",
            'invoice' => $invoice,
        ], 201);
    }

    /**
     * Display the specified invoice.
     */
    public function show(int $id): JsonResponse
    {
        $invoice = Invoice::with(['unit.floor', 'lease.tenant'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'invoice' => $invoice,
        ]);
    }

    /**
     * Record payment for an invoice.
     */
    public function recordPayment(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'payment_method' => 'required|in:Bank Transfer,bKash Corporate,Cash,Cheque',
            'transaction_reference' => 'nullable|string|max:191',
            'paid_at' => 'nullable|date',
        ]);

        $invoice->update([
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $validated['transaction_reference'] ?? null,
            'status' => 'Paid',
            'paid_at' => $validated['paid_at'] ? Carbon::parse($validated['paid_at']) : Carbon::now(),
        ]);

        $invoice->load(['unit.floor', 'lease.tenant']);

        return response()->json([
            'success' => true,
            'message' => "Payment of ৳{$invoice->total_payable_bdt} recorded via {$invoice->payment_method}.",
            'invoice' => $invoice,
        ]);
    }

    /**
     * Mark invoice as Overdue.
     */
    public function markOverdue(int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status === 'Paid') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot mark a paid invoice as overdue.',
            ], 422);
        }

        $invoice->update(['status' => 'Overdue']);

        return response()->json([
            'success' => true,
            'message' => "Invoice {$invoice->invoice_no} has been marked Overdue.",
            'invoice' => $invoice,
        ]);
    }

    /**
     * Delete an invoice.
     */
    public function destroy(int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);

        if ($invoice->status === 'Paid') {
            return response()->json([
                'success' => false,
                'message' => 'Paid invoices cannot be deleted for accounting audit compliance.',
            ], 422);
        }

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => "Invoice {$invoice->invoice_no} deleted successfully.",
        ]);
    }
}
