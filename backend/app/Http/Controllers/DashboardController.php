<?php

namespace App\Http\Controllers;

use App\Models\Floor;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\MaintenanceTicket;
use App\Models\ParkingLog;
use App\Models\Unit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get aggregate ERP dashboard statistics for management.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // If user is tenant, redirect to tenant-specific dashboard data
        if ($user && $user->role === 'tenant') {
            return $this->tenantStats($user);
        }

        // If user is parking operator, redirect to parking summary
        if ($user && $user->role === 'parking_operator') {
            return $this->parkingOperatorStats();
        }

        // General / Admin / Accounts Officer metrics:
        $totalFloors = Floor::count();
        $totalUnits = Unit::count();
        $occupiedUnits = Unit::where('status', 'Occupied')->count();
        $vacantUnits = Unit::where('status', 'Vacant')->count();
        $maintenanceUnits = Unit::where('status', 'Maintenance')->count();
        $occupancyRate = $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0;

        // Commercial Financials in BDT (৳)
        $totalBilledBdt = Invoice::sum('total_payable_bdt');
        $totalCollectedBdt = Invoice::where('status', 'Paid')->sum('total_payable_bdt');
        $totalUnpaidBdt = Invoice::where('status', 'Unpaid')->sum('total_payable_bdt');
        $totalOverdueBdt = Invoice::where('status', 'Overdue')->sum('total_payable_bdt');

        // Security deposits & Advance rent held
        $totalSecurityDeposits = Lease::where('status', 'Active')->sum('security_deposit_bdt');
        $totalAdvanceRent = Lease::where('status', 'Active')->sum('advance_rent_bdt');

        // Active Leases & Expiring soon (within 30 days)
        $activeLeasesCount = Lease::where('status', 'Active')->count();
        $expiringLeasesCount = Lease::where('status', 'Active')
            ->whereBetween('end_date', [Carbon::today(), Carbon::today()->addDays(30)])
            ->count();

        // Parking operations
        $currentlyParked = ParkingLog::where('status', 'Parked')->count();
        $todayParkingRevenue = ParkingLog::whereDate('exit_time', Carbon::today())
            ->whereIn('status', ['Exited', 'Lost Token'])
            ->sum('fee_bdt');

        // Maintenance tickets
        $openTicketsCount = MaintenanceTicket::whereIn('status', ['Open', 'In Progress'])->count();
        $urgentTicketsCount = MaintenanceTicket::whereIn('status', ['Open', 'In Progress'])
            ->where('priority', 'Urgent')
            ->count();
        $resolvedTicketsCount = MaintenanceTicket::where('status', 'Resolved')->count();

        // Recent activities
        $recentInvoices = Invoice::with(['unit', 'lease'])->latest()->limit(5)->get();
        $recentTickets = MaintenanceTicket::with(['unit', 'tenant'])->latest()->limit(5)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'property' => [
                    'total_floors' => $totalFloors,
                    'total_units' => $totalUnits,
                    'occupied_units' => $occupiedUnits,
                    'vacant_units' => $vacantUnits,
                    'maintenance_units' => $maintenanceUnits,
                    'occupancy_rate_percentage' => $occupancyRate,
                ],
                'financials_bdt' => [
                    'currency' => 'BDT (৳)',
                    'total_billed' => round((float)$totalBilledBdt, 2),
                    'total_collected' => round((float)$totalCollectedBdt, 2),
                    'total_unpaid' => round((float)$totalUnpaidBdt, 2),
                    'total_overdue' => round((float)$totalOverdueBdt, 2),
                    'total_security_deposits' => round((float)$totalSecurityDeposits, 2),
                    'total_advance_rent' => round((float)$totalAdvanceRent, 2),
                ],
                'leases' => [
                    'active_leases' => $activeLeasesCount,
                    'expiring_in_30_days' => $expiringLeasesCount,
                ],
                'parking' => [
                    'currently_parked' => $currentlyParked,
                    'today_revenue_bdt' => round((float)$todayParkingRevenue, 2),
                ],
                'facility' => [
                    'open_tickets' => $openTicketsCount,
                    'urgent_tickets' => $urgentTicketsCount,
                    'resolved_tickets' => $resolvedTicketsCount,
                ],
                'recent_invoices' => $recentInvoices,
                'recent_tickets' => $recentTickets,
            ],
        ]);
    }

    /**
     * Tenant-specific dashboard metrics.
     */
    protected function tenantStats(User $user): JsonResponse
    {
        $leases = Lease::with(['unit.floor'])
            ->where('tenant_user_id', $user->id)
            ->where('status', 'Active')
            ->get();

        $leaseIds = $leases->pluck('id');
        $unitIds = $leases->pluck('unit_id');

        $invoices = Invoice::whereIn('lease_id', $leaseIds)
            ->latest()
            ->limit(10)
            ->get();

        $dueInvoices = Invoice::whereIn('lease_id', $leaseIds)
            ->whereIn('status', ['Unpaid', 'Overdue'])
            ->get();

        $totalDueBdt = $dueInvoices->sum('total_payable_bdt');

        $myTickets = MaintenanceTicket::where('tenant_user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'role' => 'tenant',
                'active_units' => $leases,
                'total_due_bdt' => round((float)$totalDueBdt, 2),
                'due_invoices_count' => $dueInvoices->count(),
                'recent_invoices' => $invoices,
                'recent_tickets' => $myTickets,
            ],
        ]);
    }

    /**
     * Parking operator specific dashboard metrics.
     */
    protected function parkingOperatorStats(): JsonResponse
    {
        $currentlyParked = ParkingLog::where('status', 'Parked')->count();

        $byType = ParkingLog::where('status', 'Parked')
            ->selectRaw('vehicle_type, count(*) as count')
            ->groupBy('vehicle_type')
            ->pluck('count', 'vehicle_type');

        $todayRevenue = ParkingLog::whereDate('exit_time', Carbon::today())
            ->whereIn('status', ['Exited', 'Lost Token'])
            ->sum('fee_bdt');

        $recentEntries = ParkingLog::latest('entry_time')->limit(10)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'role' => 'parking_operator',
                'currently_parked' => $currentlyParked,
                'by_vehicle_type' => $byType,
                'today_revenue_bdt' => round((float)$todayRevenue, 2),
                'recent_entries' => $recentEntries,
            ],
        ]);
    }
}
