import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatBDT, formatDate } from '../../utils/formatters';
import {
  FileCheck,
  Plus,
  Search,
  Building,
  UserCheck,
  Phone,
  FileText,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function AdminLeases() {
  const [leases, setLeases] = useState([]);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // New Lease Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedLeaseDetails, setSelectedLeaseDetails] = useState(null);

  const [leaseForm, setLeaseForm] = useState({
    agreement_no: '',
    unit_id: '',
    company_or_shop_name: '',
    proprietor_name: '',
    phone_bd: '',
    trade_license_no: '',
    tin_no: '',
    security_deposit_bdt: '',
    advance_rent_bdt: '',
    start_date: '',
    end_date: '',
    status: 'Active',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leasesRes, unitsRes] = await Promise.all([
        api.get('/leases'),
        api.get('/units?status=Vacant'),
      ]);
      setLeases(leasesRes.data?.leases?.data || leasesRes.data?.leases || []);
      setVacantUnits(unitsRes.data?.units?.data || unitsRes.data?.units || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Could not load lease registry records.');
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

  const handleOpenNewLease = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];

    const autoCode = 'TOC-LSE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    setLeaseForm({
      agreement_no: autoCode,
      unit_id: vacantUnits[0]?.id || '',
      company_or_shop_name: '',
      proprietor_name: '',
      phone_bd: '+8801',
      trade_license_no: 'TRAD/DNCC/',
      tin_no: '',
      security_deposit_bdt: '',
      advance_rent_bdt: '',
      start_date: today,
      end_date: nextYearStr,
      status: 'Active',
    });
    setShowModal(true);
  };

  const handleSaveLease = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leases', leaseForm);
      notify('success', `Agreement ${leaseForm.agreement_no} executed! Unit marked as Occupied.`);
      setShowModal(false);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to create lease agreement.');
    }
  };

  const handleTerminateLease = async (lease) => {
    if (!window.confirm(`Are you sure you want to terminate Agreement ${lease.agreement_no}? This will free Unit ${lease.unit?.unit_no} back to Vacant status.`)) {
      return;
    }
    try {
      await api.post(`/leases/${lease.id}/terminate`);
      notify('success', `Agreement ${lease.agreement_no} terminated. Unit is now Vacant.`);
      fetchData();
      if (selectedLeaseDetails?.id === lease.id) {
        setSelectedLeaseDetails(null);
      }
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error terminating lease.');
    }
  };

  const filteredLeases = leases.filter((l) => {
    const matchStatus = !filterStatus || l.status === filterStatus;
    const matchSearch =
      !search ||
      l.agreement_no?.toLowerCase().includes(search.toLowerCase()) ||
      l.company_or_shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.proprietor_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.unit?.unit_no?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
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

      {/* Header and Onboard Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Tenant Onboarding & Lease Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Execute commercial tenancy contracts with Bangladeshi Trade License & e-TIN compliance.
          </p>
        </div>

        <button
          onClick={handleOpenNewLease}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Onboard New Tenant
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Agreement, Company, Tenant..."
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
            <option value="">All Lease Statuses</option>
            <option value="Active">Active</option>
            <option value="Terminated">Terminated</option>
            <option value="Expired">Expired</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong>{filteredLeases.length}</strong> Agreements on record
        </div>
      </div>

      {/* Leases Table */}
      {filteredLeases.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Commercial Leases Registered"
          description="Click 'Onboard New Tenant' to assign a vacant commercial shop or office suite to a tenant business."
          actionText="Onboard New Tenant"
          onAction={handleOpenNewLease}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Agreement No</th>
                  <th className="py-3 px-4">Demised Space</th>
                  <th className="py-3 px-4">Company & Proprietor</th>
                  <th className="py-3 px-4">Trade License / TIN</th>
                  <th className="py-3 px-4 text-right">Security Deposit (৳)</th>
                  <th className="py-3 px-4 text-right">Advance Rent (৳)</th>
                  <th className="py-3 px-4">Tenure Period</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeases.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {l.agreement_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        Unit {l.unit?.unit_no || 'Unassigned'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {l.unit?.floor?.level_name} • {l.unit?.size_sqft} sqft
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{l.company_or_shop_name}</div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        {l.proprietor_name} ({l.phone_bd})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-semibold">{l.trade_license_no}</div>
                      <div className="text-[10px] text-slate-500 font-mono">TIN: {l.tin_no}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatBDT(l.security_deposit_bdt)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {formatBDT(l.advance_rent_bdt)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      {formatDate(l.start_date)} → {formatDate(l.end_date)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          l.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : l.status === 'Terminated'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLeaseDetails(l)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="View Agreement Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {l.status === 'Active' && (
                          <button
                            onClick={() => handleTerminateLease(l)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Terminate Agreement"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD NEW TENANT */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                Execute Commercial Tenancy Agreement
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLease} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agreement No *</label>
                  <input
                    type="text"
                    required
                    value={leaseForm.agreement_no}
                    onChange={(e) => setLeaseForm({ ...leaseForm, agreement_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Vacant Space *</label>
                  <select
                    required
                    value={leaseForm.unit_id}
                    onChange={(e) => setLeaseForm({ ...leaseForm, unit_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Select Vacant Unit</option>
                    {vacantUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unit_no} ({u.floor?.level_name} • {u.size_sqft} sqft • ৳{u.base_rent_bdt}/mo)
                      </option>
                    ))}
                  </select>
                  {vacantUnits.length === 0 && (
                    <p className="text-[10px] text-rose-500 mt-1">
                      No vacant units available. Create or free a unit first.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company / Shop Trade Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Tech Solutions Ltd."
                    value={leaseForm.company_or_shop_name}
                    onChange={(e) => setLeaseForm({ ...leaseForm, company_or_shop_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proprietor / MD Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammad Rafiqul Islam"
                    value={leaseForm.proprietor_name}
                    onChange={(e) => setLeaseForm({ ...leaseForm, proprietor_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number (BD) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+8801XXXXXXXXX"
                    value={leaseForm.phone_bd}
                    onChange={(e) => setLeaseForm({ ...leaseForm, phone_bd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trade License No *</label>
                  <input
                    type="text"
                    required
                    placeholder="TRAD/DNCC/XXXXXX/2026"
                    value={leaseForm.trade_license_no}
                    onChange={(e) => setLeaseForm({ ...leaseForm, trade_license_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">12-Digit e-TIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 847291038472"
                    value={leaseForm.tin_no}
                    onChange={(e) => setLeaseForm({ ...leaseForm, tin_no: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Security Deposit (BDT ৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 250000"
                    value={leaseForm.security_deposit_bdt}
                    onChange={(e) => setLeaseForm({ ...leaseForm, security_deposit_bdt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Advance Rent (BDT ৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 100000"
                    value={leaseForm.advance_rent_bdt}
                    onChange={(e) => setLeaseForm({ ...leaseForm, advance_rent_bdt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commencement Date *</label>
                  <input
                    type="date"
                    required
                    value={leaseForm.start_date}
                    onChange={(e) => setLeaseForm({ ...leaseForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiration Date *</label>
                  <input
                    type="date"
                    required
                    value={leaseForm.end_date}
                    onChange={(e) => setLeaseForm({ ...leaseForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                ℹ️ Registering this agreement will bind the demised space and automatically update the unit status to <strong>Occupied</strong> across the entire ERP directory.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vacantUnits.length === 0}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 font-bold uppercase tracking-wider"
                >
                  Execute Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW LEASE DETAILS */}
      {selectedLeaseDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-400" />
                Agreement #{selectedLeaseDetails.agreement_no}
              </h3>
              <button
                onClick={() => setSelectedLeaseDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company / Business</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedLeaseDetails.company_or_shop_name}</p>
                  <p className="text-slate-600">Proprietor: {selectedLeaseDetails.proprietor_name}</p>
                  <p className="text-slate-600">Phone: {selectedLeaseDetails.phone_bd}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demised Space</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">Unit {selectedLeaseDetails.unit?.unit_no}</p>
                  <p className="text-slate-600">{selectedLeaseDetails.unit?.floor?.level_name} ({selectedLeaseDetails.unit?.floor?.zone_type})</p>
                  <p className="text-slate-600">{selectedLeaseDetails.unit?.size_sqft} Sq. Ft.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-slate-500 block">Trade License:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedLeaseDetails.trade_license_no}</p>
                </div>
                <div>
                  <span className="text-slate-500 block">Bangladeshi e-TIN:</span>
                  <p className="font-mono font-bold text-slate-900">{selectedLeaseDetails.tin_no}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div>
                  <span className="text-amber-800 font-semibold block">Security Deposit Held:</span>
                  <p className="text-sm font-black text-amber-950">{formatBDT(selectedLeaseDetails.security_deposit_bdt)}</p>
                </div>
                <div>
                  <span className="text-amber-800 font-semibold block">Advance Rent Balance:</span>
                  <p className="text-sm font-black text-amber-950">{formatBDT(selectedLeaseDetails.advance_rent_bdt)}</p>
                </div>
              </div>

              <div className="text-slate-600">
                <span>Contract Tenure: </span>
                <strong className="text-slate-900">
                  {formatDate(selectedLeaseDetails.start_date)} to {formatDate(selectedLeaseDetails.end_date)}
                </strong>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {selectedLeaseDetails.status === 'Active' ? (
                  <button
                    onClick={() => handleTerminateLease(selectedLeaseDetails)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Terminate Lease
                  </button>
                ) : (
                  <span className="text-slate-400 font-semibold">Contract is {selectedLeaseDetails.status}</span>
                )}

                <button
                  onClick={() => setSelectedLeaseDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
