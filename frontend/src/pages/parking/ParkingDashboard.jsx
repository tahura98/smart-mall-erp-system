import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import api from '../../api/axios';
import { formatBDT, formatDateTime } from '../../utils/formatters';
import {
  Car,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  Layers,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function ParkingDashboard() {
  const [live, setLive] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Check-In Form State
  const [entryForm, setEntryForm] = useState({
    metro: 'Dhaka Metro',
    series: 'Ga',
    number: '',
    vehicle_type: 'Car',
    basement_zone: 'Basement 1 - Zone A',
  });

  // Check-Out Modal / Calculation
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [checkoutCalculation, setCheckoutCalculation] = useState(null);

  // Token Print Modal
  const [lastIssuedToken, setLastIssuedToken] = useState(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Parked');

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
      notify('error', 'Could not load live parking terminal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Process Entry
  const handleVehicleEntry = async (e) => {
    e.preventDefault();
    if (!entryForm.number.trim()) {
      notify('error', 'Please enter the vehicle registration number (e.g. 11-2233).');
      return;
    }

    const fullRegNo = `${entryForm.metro}-${entryForm.series}-${entryForm.number.trim()}`;

    try {
      const res = await api.post('/parking/entry', {
        vehicle_reg_no: fullRegNo,
        vehicle_type: entryForm.vehicle_type,
        basement_zone: entryForm.basement_zone,
      });

      const tokenData = res.data?.parking_log;
      notify('success', `Token #${tokenData?.token_no} issued for ${fullRegNo}.`);
      setLastIssuedToken(tokenData);

      // Reset form number
      setEntryForm({ ...entryForm, number: '' });
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error processing vehicle check-in.');
    }
  };

  // Open Checkout Fee Preview
  const handleOpenCheckout = async (log) => {
    setCheckoutTarget(log);
    try {
      const res = await api.get(`/parking/calculate/${log.id}`);
      setCheckoutCalculation(res.data);
    } catch (err) {
      notify('error', 'Error calculating parking tariff.');
    }
  };

  // Confirm Checkout
  const handleConfirmCheckout = async () => {
    if (!checkoutTarget) return;
    try {
      const res = await api.post(`/parking/checkout/${checkoutTarget.id}`);
      notify('success', `Vehicle ${checkoutTarget.vehicle_reg_no} checked out. Fee: ৳${res.data?.parking_log?.fee_bdt}`);
      setCheckoutTarget(null);
      setCheckoutCalculation(null);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error completing checkout.');
    }
  };

  // Lost Token Penalty
  const handleLostToken = async (log) => {
    if (!window.confirm(`Mark Token ${log.token_no} as Lost? A statutory ৳500 penalty fee will be billed.`)) {
      return;
    }
    try {
      await api.post(`/parking/lost-token/${log.id}`);
      notify('success', `Token ${log.token_no} marked Lost. ৳500 fine billed.`);
      setCheckoutTarget(null);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error recording lost token.');
    }
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header currentSection="parking" />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col space-y-6">
        {/* Toast Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Counters Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Currently Parked
            </span>
            <div className="text-3xl font-black">{live?.currently_parked || 0}</div>
            <p className="text-[11px] text-slate-400 mt-1">Live active basement slots</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Today's Tariff Collections
            </span>
            <div className="text-2xl font-black text-emerald-600">
              {formatBDT(live?.today_revenue_bdt)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Settled upon vehicle exit</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Vehicle Type Breakdown
            </span>
            <div className="text-xs font-bold text-slate-800 mt-1 space-y-1">
              <div className="flex justify-between">
                <span>Cars:</span> <strong>{live?.breakdown_by_type?.Car || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>Motorbikes:</span> <strong>{live?.breakdown_by_type?.Bike || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>SUVs:</span> <strong>{live?.breakdown_by_type?.SUV || 0}</strong>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Tariff Schedule (BDT)
            </span>
            <div className="text-[11px] text-slate-600 space-y-0.5 mt-1">
              <p>• <strong>Car:</strong> ৳100 (2 hrs) + ৳50/hr</p>
              <p>• <strong>Bike:</strong> ৳30 (2 hrs) + ৳10/hr</p>
              <p>• <strong>SUV:</strong> ৳120 (2 hrs) + ৳60/hr</p>
              <p>• <strong>Lost Token:</strong> ৳500 penalty</p>
            </div>
          </div>
        </div>

        {/* Check-In Terminal Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500" />
                Vehicle Check-In & Token Issuance Terminal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bangladeshi Metro registration plate generator and automated RFID/Barcode token issuer.
              </p>
            </div>
          </div>

          <form onSubmit={handleVehicleEntry} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {/* Metro District */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Metro Authority</label>
              <select
                value={entryForm.metro}
                onChange={(e) => setEntryForm({ ...entryForm, metro: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Dhaka Metro">Dhaka Metro</option>
                <option value="Chattogram Metro">Chattogram Metro</option>
                <option value="Sylhet Metro">Sylhet Metro</option>
                <option value="Rajshahi Metro">Rajshahi Metro</option>
                <option value="Khulna Metro">Khulna Metro</option>
              </select>
            </div>

            {/* Metro Series */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Series</label>
              <select
                value={entryForm.series}
                onChange={(e) => setEntryForm({ ...entryForm, series: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Ga">Ga (গা) - Private Car</option>
                <option value="Gha">Gha (ঘ) - SUV / Jeep</option>
                <option value="Kha">Kha (খ) - Microbus</option>
                <option value="Ha">Ha (হ) - Motorbike</option>
                <option value="La">La (ল) - Motorbike</option>
                <option value="Cha">Cha (চ) - Microbus</option>
              </select>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Number (XX-XXXX) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 11-2233"
                value={entryForm.number}
                onChange={(e) => setEntryForm({ ...entryForm, number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Vehicle Classification</label>
              <select
                value={entryForm.vehicle_type}
                onChange={(e) => setEntryForm({ ...entryForm, vehicle_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Car">Sedan / Hatchback (Car)</option>
                <option value="Bike">Motorcycle (Bike)</option>
                <option value="SUV">SUV / 4x4 / Jeep</option>
              </select>
            </div>

            {/* Basement Zone */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Basement Zone</label>
              <select
                value={entryForm.basement_zone}
                onChange={(e) => setEntryForm({ ...entryForm, basement_zone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Basement 1 - Zone A">Basement 1 - Zone A</option>
                <option value="Basement 1 - Zone B">Basement 1 - Zone B</option>
                <option value="Basement 2 - Zone A">Basement 2 - Zone A</option>
                <option value="Basement 2 - Zone B">Basement 2 - Zone B</option>
              </select>
            </div>

            <div className="sm:col-span-5 flex justify-end mt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <Car className="w-4 h-4" /> Issue Gate Token & Admit Vehicle
              </button>
            </div>
          </form>
        </div>

        {/* Live Parking Table */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Scan Token or Type Plate #..."
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
                <option value="Parked">Currently Parked</option>
                <option value="Exited">Exited Vehicles</option>
                <option value="Lost Token">Lost Tokens</option>
                <option value="">All History</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              <strong>{filteredLogs.length}</strong> Vehicles in view
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No Vehicles in Selected View"
              description="Use the check-in terminal above to register an arriving vehicle into the basement parking lot."
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Token No</th>
                      <th className="py-3 px-4">Number Plate</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Basement Zone</th>
                      <th className="py-3 px-4">Entry Timestamp</th>
                      <th className="py-3 px-4">Exit Timestamp</th>
                      <th className="py-3 px-4 text-right">Fee (৳)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Gate Action</th>
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
                        <td className="py-3 px-4 text-right">
                          {log.status === 'Parked' ? (
                            <button
                              onClick={() => handleOpenCheckout(log)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm active:scale-95"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Check Out
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: CHECKOUT & TARIFF CALCULATOR */}
      {checkoutTarget && checkoutCalculation && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                Vehicle Exit & Tariff Settlement
              </h3>
              <button
                onClick={() => setCheckoutTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle Info</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {checkoutCalculation.vehicle_reg_no}
                </p>
                <p className="text-slate-600">
                  {checkoutCalculation.vehicle_type} • Token #{checkoutCalculation.token_no}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Entry Time:</span>
                  <p className="font-bold text-slate-800">{formatDateTime(checkoutCalculation.entry_time)}</p>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Duration:</span>
                  <p className="font-bold text-slate-800">{checkoutCalculation.duration_hours} Hours</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                  Total Parking Fee Due
                </span>
                <div className="text-3xl font-black text-slate-950 mt-1">
                  {formatBDT(checkoutCalculation.estimated_fee_bdt)}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleLostToken(checkoutTarget)}
                  className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Lost Token (৳500)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutTarget(null)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCheckout}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider shadow-sm active:scale-95"
                  >
                    Collect & Open Gate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOKEN PRINT PREVIEW */}
      {lastIssuedToken && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                Parking Entry Token
              </h3>
              <button
                onClick={() => setLastIssuedToken(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-center text-xs space-y-4">
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase">Total Office Center</h4>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">Commercial Basement Parking</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Token Number</span>
                <p className="text-xl font-mono font-black text-slate-900 mt-0.5">{lastIssuedToken.token_no}</p>
                <div className="mt-3 pt-3 border-t border-slate-200 text-left space-y-1">
                  <p><strong>Plate:</strong> <span className="font-mono">{lastIssuedToken.vehicle_reg_no}</span></p>
                  <p><strong>Type:</strong> {lastIssuedToken.vehicle_type}</p>
                  <p><strong>Zone:</strong> {lastIssuedToken.basement_zone}</p>
                  <p><strong>Entry:</strong> {formatDateTime(lastIssuedToken.entry_time)}</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Please retain token. Lost token fee is ৳500.00 standard penalty.
              </p>

              <button
                onClick={() => setLastIssuedToken(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
