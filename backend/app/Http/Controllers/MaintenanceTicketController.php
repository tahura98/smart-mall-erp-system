<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceTicket;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MaintenanceTicketController extends Controller
{
    /**
     * Display a listing of maintenance tickets.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = MaintenanceTicket::with(['unit.floor', 'tenant']);

        // Tenants only see their own tickets
        if ($user && $user->role === 'tenant') {
            $query->where('tenant_user_id', $user->id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('issue_category') && $request->issue_category) {
            $query->where('issue_category', $request->issue_category);
        }

        if ($request->has('unit_id') && $request->unit_id) {
            $query->where('unit_id', $request->unit_id);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_no', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tickets = $query->latest()->paginate(25);

        return response()->json([
            'success' => true,
            'tickets' => $tickets,
        ]);
    }

    /**
     * Store a newly created maintenance ticket.
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->filled('ticket_no')) {
            $request->merge([
                'ticket_no' => 'TOC-TKT-' . date('Ym') . '-' . strtoupper(Str::random(4)),
            ]);
        }

        $validated = $request->validate([
            'ticket_no' => 'required|string|max:100|unique:maintenance_tickets,ticket_no',
            'unit_id' => 'nullable|exists:units,id',
            'issue_category' => 'required|in:Central AC,Electrical,Plumbing,Elevator,Security',
            'description' => 'required|string',
            'priority' => 'nullable|in:Low,Medium,High,Urgent',
        ]);

        $ticket = MaintenanceTicket::create([
            'ticket_no' => $validated['ticket_no'],
            'unit_id' => $validated['unit_id'] ?? null,
            'tenant_user_id' => $request->user()?->id,
            'issue_category' => $validated['issue_category'],
            'description' => $validated['description'],
            'priority' => $validated['priority'] ?? 'Medium',
            'status' => 'Open',
        ]);

        $ticket->load(['unit.floor', 'tenant']);

        return response()->json([
            'success' => true,
            'message' => "Ticket {$ticket->ticket_no} submitted successfully.",
            'ticket' => $ticket,
        ], 201);
    }

    /**
     * Display the specified ticket.
     */
    public function show(int $id): JsonResponse
    {
        $ticket = MaintenanceTicket::with(['unit.floor', 'tenant'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'ticket' => $ticket,
        ]);
    }

    /**
     * Update maintenance ticket status and resolution notes.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $ticket = MaintenanceTicket::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Open,In Progress,Resolved,Closed',
            'resolution_notes' => 'nullable|string',
        ]);

        $updates = [
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'] ?? $ticket->resolution_notes,
        ];

        if (in_array($validated['status'], ['Resolved', 'Closed']) && !$ticket->resolved_at) {
            $updates['resolved_at'] = Carbon::now();
        }

        $ticket->update($updates);
        $ticket->load(['unit.floor', 'tenant']);

        return response()->json([
            'success' => true,
            'message' => "Ticket {$ticket->ticket_no} updated to status '{$ticket->status}'.",
            'ticket' => $ticket,
        ]);
    }

    /**
     * Delete a maintenance ticket.
     */
    public function destroy(int $id): JsonResponse
    {
        $ticket = MaintenanceTicket::findOrFail($id);
        $ticket->delete();

        return response()->json([
            'success' => true,
            'message' => "Ticket {$ticket->ticket_no} deleted successfully.",
        ]);
    }
}
