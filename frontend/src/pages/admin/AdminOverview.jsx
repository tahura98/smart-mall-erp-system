import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatBDT, formatNumber, formatDate } from '../../utils/formatters';
import {
  Building2,
  TrendingUp,
  Banknote,
  AlertCircle,
  Wrench,
  Car,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  FileText,
  RefreshCw,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function AdminOverview({ onNavigate, onSelectInvoice }) {
  const [stats, setStats] = useState(null);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, floorsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/floors'),
      ]);
      setStats(statsRes.data?.data || null);
      setFloors(floorsRes.data?.floors || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load live dashboard metrics from the ERP server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold tracking-wide uppercase">
          Loading Total Office Center Metrics...
        </p>
      </div>
    );
  }

  const prop = stats?.property || {};
  const fin = stats?.financials_bdt || {};
  const leases = stats?.leases || {};
  const parking = stats?.parking || {};
  const facility = stats?.facility || {};
  const recentInvoices = stats?.recent_invoices || [];
  const recentTickets = stats?.recent_tickets || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Executive Command Center
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Live ERP
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time complex occupancy, utility sub-metering, and financial billing performance in BDT (৳).
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          Refresh Live Data
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 Primary Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Occupancy Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {prop.occupancy_rate_percentage || 0}%
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{prop.occupied_units || 0} Occupied</span>
            <span className="text-amber-600 font-semibold">{prop.vacant_units || 0} Vacant</span>
          </div>
        </div>

        {/* KPI 2: Total Rent & CAM Collected */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Collected (BDT)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600 tracking-tight">
            {formatBDT(fin.total_collected)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Billed: {formatBDT(fin.total_billed)}</span>
          </div>
        </div>

        {/* KPI 3: Receivables / Due */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Receivables</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600 tracking-tight">
            {formatBDT((fin.total_unpaid || 0) + (fin.total_overdue || 0))}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Unpaid: {formatBDT(fin.total_unpaid)}</span>
            <span className="text-rose-600 font-semibold">Overdue: {formatBDT(fin.total_overdue)}</span>
          </div>
        </div>

        {/* KPI 4: Security Deposits Held */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Deposits Held</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700 tracking-tight">
            {formatBDT(fin.total_security_deposits)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Active Leases: {leases.active_leases || 0}</span>
          </div>
        </div>

        {/* KPI 5: Facilities & Parking */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Maintenance</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {facility.open_tickets || 0}{' '}
            <span className="text-xs font-normal text-slate-500">Open</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-rose-600 font-bold">{facility.urgent_tickets || 0} Urgent</span>
            <span>Parked: {parking.currently_parked || 0}</span>
          </div>
        </div>
      </div>

      {/* Floor-wise Occupancy & Distribution Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Floor-Wise Space Utilization & Occupancy Spectrum
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live capacity breakdown per architectural level and zoning block.
            </p>
          </div>
          <button
            onClick={() => onNavigate('directory')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline"
          >
            Manage Floors <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {floors.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No Floors Registered Yet"
            description="Initialize your commercial complex floors (e.g. Ground Floor, Level 1, Food Court) to view live occupancy charts."
            actionText="Add First Floor"
            onAction={() => onNavigate('directory')}
          />
        ) : (
          <div className="space-y-4">
            {floors.map((fl) => {
              const totalUnits = Number(fl.units_count || 0);
              const occupied = Number(fl.occupied_units_count || 0);
              const rate = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;

              return (
                <div key={fl.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900">{fl.level_name}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                        {fl.zone_type}
                      </span>
                      {fl.block_code && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {fl.block_code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <span>{occupied} of {totalUnits} Units Occupied</span>
                      <span className="text-slate-900 font-bold">{rate}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${rate}%` }}
                      className={`h-full transition-all duration-500 rounded-full ${
                        rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-slate-400'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Recent Invoices & Recent Maintenance Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Recent Commercial Invoices
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Latest billing statements issued across units.</p>
            </div>
            <button
              onClick={() => onNavigate('billing')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline"
            >
              All Invoices <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Invoices Issued"
              description="No monthly utility and commercial rent bills have been generated yet."
              actionText="Generate First Bill"
              onAction={() => onNavigate('billing')}
            />
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{inv.invoice_no}</span>
                    <span className="text-slate-500 text-[11px]">
                      Unit {inv.unit?.unit_no || 'N/A'} • {inv.billing_month}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{formatBDT(inv.total_payable_bdt)}</div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectInvoice(inv)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Print Receipt"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Maintenance Tickets */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-500" />
                Active Facilities & HVAC Tickets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Central AC, elevators, and electrical tickets.</p>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              All Tickets <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTickets.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="All Facilities Operational"
              description="Zero open maintenance or breakdown tickets reported across the complex."
              actionText="View Maintenance Desk"
              onAction={() => onNavigate('maintenance')}
            />
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden">
              {recentTickets.map((tkt) => (
                <div key={tkt.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{tkt.ticket_no}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {tkt.issue_category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1 mt-0.5">{tkt.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tkt.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : tkt.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tkt.priority}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{tkt.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
