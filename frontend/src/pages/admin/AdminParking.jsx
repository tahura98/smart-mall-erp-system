import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatBDT, formatDateTime } from '../../utils/formatters';
import {
  Car,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Layers,
  Banknote,
  RefreshCw,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function AdminParking() {
  const [live, setLive] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [liveRes, logsRes] = await Promise.all([
        api.get('/parking/live'),
        api.get('/parking/logs'),
      ]);
      setLive(liveRes.data || null);
      setLogs(logsRes.data?.parking_logs?.data || logsRes.data?.parking_logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchSearch =
      !search ||
      l.token_no?.toLowerCase().includes(search.toLowerCase()) ||
      l.vehicle_reg_no?.toLowerCase().includes(search.toLowerCase()) ||
      l.basement_zone?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Basement Parking Terminal Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitor of basement vehicle zones, parking tokens, and hourly revenue in BDT (৳).
          </p>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          Refresh Parking Feed
        </button>
      </div>

      {/* Live Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Currently Parked Vehicles
          </span>
          <div className="text-3xl font-black text-slate-900">
            {live?.currently_parked || 0}
          </div>
          <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center gap-2">
            <span>Cars: <strong>{live?.breakdown_by_type?.Car || 0}</strong></span>
            <span>•</span>
            <span>Bikes: <strong>{live?.breakdown_by_type?.Bike || 0}</strong></span>
            <span>•</span>
            <span>SUVs: <strong>{live?.breakdown_by_type?.SUV || 0}</strong></span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Today's Parking Tariff Revenue
          </span>
          <div className="text-3xl font-black text-emerald-600">
            {formatBDT(live?.today_revenue_bdt)}
          </div>
          <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
            Auto-tariff: Car (৳100 base) • Bike (৳30) • SUV (৳120)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Active Basement Zones
          </span>
          <div className="text-sm font-bold text-slate-800 space-y-1">
            {live?.breakdown_by_zone && Object.keys(live.breakdown_by_zone).length > 0 ? (
              Object.entries(live.breakdown_by_zone).map(([zone, count]) => (
                <div key={zone} className="flex justify-between items-center text-xs">
                  <span>{zone}:</span>
                  <strong className="text-slate-900">{count} vehicles</strong>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs italic">All basement zones are vacant.</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Token #, Number Plate, Zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Vehicle Statuses</option>
            <option value="Parked">Currently Parked</option>
            <option value="Exited">Exited</option>
            <option value="Lost Token">Lost Token</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong>{filteredLogs.length}</strong> Records on log
        </div>
      </div>

      {/* Parking Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No Vehicle Parking Activity Logged"
          description="Vehicle entries, basement zone assignments, and exit tariffs will dynamically reflect here in real-time."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Token No</th>
                  <th className="py-3 px-4">Registration Plate</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Basement Zone</th>
                  <th className="py-3 px-4">Entry Time</th>
                  <th className="py-3 px-4">Exit Time</th>
                  <th className="py-3 px-4 text-right">Tariff Fee (৳)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.token_no}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {log.vehicle_reg_no}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        {log.vehicle_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {log.basement_zone}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {formatDateTime(log.entry_time)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {log.exit_time ? formatDateTime(log.exit_time) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-950">
                      {formatBDT(log.fee_bdt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'Parked'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : log.status === 'Exited'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
