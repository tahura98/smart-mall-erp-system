import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatBDT, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Building2,
  FileText,
  Wrench,
  Printer,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import InvoicePrintModal from '../../components/common/InvoicePrintModal';

export default function TenantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('unit'); // 'unit', 'invoices', 'tickets'

  const [dashboardData, setDashboardData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Print Invoice Modal
  const [activePrintInvoice, setActivePrintInvoice] = useState(null);

  // Submit Ticket Modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    unit_id: '',
    issue_category: 'Central AC',
    priority: 'Medium',
    description: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, invRes, tktRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/invoices'),
        api.get('/maintenance/tickets'),
      ]);
      setDashboardData(dashRes.data?.data || null);
      setInvoices(invRes.data?.invoices?.data || invRes.data?.invoices || []);
      setTickets(tktRes.data?.tickets?.data || tktRes.data?.tickets || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Could not load tenant account records.');
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

  const handleOpenTicketModal = () => {
    const activeLease = dashboardData?.active_units?.[0];
    setTicketForm({
      unit_id: activeLease?.unit_id || '',
      issue_category: 'Central AC',
      priority: 'Medium',
      description: '',
    });
    setShowTicketModal(true);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/maintenance/tickets', ticketForm);
      notify('success', `Ticket ${res.data?.ticket?.ticket_no} submitted to facility engineers.`);
      setShowTicketModal(false);
      fetchData();
      setActiveTab('tickets');
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to submit maintenance ticket.');
    }
  };

  const activeLeases = dashboardData?.active_units || [];
  const primaryLease = activeLeases[0] || null;
  const totalDue = dashboardData?.total_due_bdt || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header currentSection="tenant" />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Toast Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between mb-4 shadow-md transition-all ${
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

        {/* Tenant Welcome & Summary Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-6 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                Commercial Tenant Portal
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {primaryLease?.company_or_shop_name || user?.name || 'Valued Commercial Tenant'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                Total Office Center • Unit {primaryLease?.unit?.unit_no || 'Assigned Commercial Space'} • Agreement #{primaryLease?.agreement_no || 'TOC-CONFIRMED'}
              </p>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 min-w-[220px] text-right">
              <span className="text-[11px] text-slate-400 uppercase font-bold block">
                Outstanding Balance Due
              </span>
              <div className={`text-2xl font-black mt-1 ${totalDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatBDT(totalDue)}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {totalDue > 0 ? `${dashboardData?.due_invoices_count || 1} Statement(s) Pending` : 'All Bills Fully Settled'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 mb-6 shadow-sm flex items-center gap-1">
          <button
            onClick={() => setActiveTab('unit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'unit'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>My Commercial Unit</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'invoices'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoices & Money Receipts ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tickets'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Maintenance & AC Requests ({tickets.length})</span>
          </button>
        </div>

        {/* TAB 1: MY COMMERCIAL UNIT */}
        {activeTab === 'unit' && (
          <div className="space-y-6">
            {!primaryLease ? (
              <EmptyState
                icon={Building2}
                title="No Active Tenancy Lease Associated"
                description="Your account is not currently bound to an active demised space in Total Office Center. Please contact complex management."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Space Specs */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Demised Space Specifications
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Architectural zoning, floor area, and monthly lease schedule.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Assigned Unit & Type
                      </span>
                      <p className="text-lg font-black text-slate-900">
                        Unit {primaryLease.unit?.unit_no}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {primaryLease.unit?.unit_type} • {primaryLease.unit?.floor?.level_name} ({primaryLease.unit?.floor?.zone_type})
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Floor Area & Space
                      </span>
                      <p className="text-lg font-black text-slate-900">
                        {Number(primaryLease.unit?.size_sqft).toLocaleString()} Sq. Ft.
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        CAM Rate: ৳{primaryLease.unit?.cam_rate_per_sqft}/sqft/month
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Base Monthly Rent
                      </span>
                      <p className="text-lg font-black text-slate-900">
                        {formatBDT(primaryLease.unit?.base_rent_bdt)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Excludes CAM & sub-meter electricity</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Security Deposit Held
                      </span>
                      <p className="text-lg font-black text-amber-800">
                        {formatBDT(primaryLease.security_deposit_bdt)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Advance Rent: {formatBDT(primaryLease.advance_rent_bdt)}</p>
                    </div>
                  </div>

                  {/* Legal Registration */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Bangladeshi Commercial Compliance
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
                      <div>
                        <span className="text-slate-500">Trade License No:</span>
                        <p className="font-mono font-bold">{primaryLease.trade_license_no}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">12-Digit e-TIN:</span>
                        <p className="font-mono font-bold">{primaryLease.tin_no}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Registered Phone:</span>
                        <p className="font-mono font-bold">{primaryLease.phone_bd}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Contract Tenure:</span>
                        <p className="font-bold">{formatDate(primaryLease.start_date)} → {formatDate(primaryLease.end_date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Remittance Instructions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    Billing & Remittance Guidelines
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Total Office Center issues monthly utility & rent statements on the 1st of every month. Payments are due by the 10th.
                  </p>

                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs text-amber-950">
                    <span className="font-bold block">Accepted Payment Channels:</span>
                    <ul className="space-y-1 list-disc list-inside">
                      <li><strong>bKash Corporate:</strong> Merchant # 01700-000000 (Counter Ref: Unit No)</li>
                      <li><strong>Bank Transfer / BEFTN / NPSB:</strong> Prime Bank Ltd, Gulshan Branch</li>
                      <li><strong>Accounts Counter:</strong> Cash or Pay Order at Level 2 Accounts Office</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleOpenTicketModal}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    Report Maintenance Issue
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVOICES & RECEIPTS */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Billing Statements Issued Yet"
                description="Your commercial unit billing statements and official payment receipts will appear here automatically."
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Invoice No</th>
                        <th className="py-3 px-4">Billing Month</th>
                        <th className="py-3 px-4 text-right">Rent (৳)</th>
                        <th className="py-3 px-4 text-right">CAM (৳)</th>
                        <th className="py-3 px-4 text-right">Electricity (৳)</th>
                        <th className="py-3 px-4 text-right">VAT 5% (৳)</th>
                        <th className="py-3 px-4 text-right">Total (৳)</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Official Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {inv.invoice_no}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {inv.billing_month}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-700">
                            {formatBDT(inv.rent_amount)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {formatBDT(inv.cam_charge)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {formatBDT(inv.electricity_bill)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {formatBDT(inv.vat_amount)}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-950">
                            {formatBDT(inv.total_payable_bdt)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                inv.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : inv.status === 'Overdue'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setActivePrintInvoice(inv)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[11px] transition-all shadow-sm active:scale-95"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              Print Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MAINTENANCE REQUESTS */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Facility Service Requests</h3>
                <p className="text-xs text-slate-500">Report Central AC, electrical, or plumbing issues.</p>
              </div>
              <button
                onClick={handleOpenTicketModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Plus className="w-4 h-4" /> New Ticket
              </button>
            </div>

            {tickets.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="No Service Tickets Logged"
                description="Need maintenance for your Central AC or electrical fittings? Submit a ticket anytime."
                actionText="Submit Maintenance Request"
                onAction={handleOpenTicketModal}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Ticket No</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4 text-center">Priority</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4">Logged On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tickets.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {t.ticket_no}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {t.issue_category}
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <p className="text-slate-800 line-clamp-2">{t.description}</p>
                            {t.resolution_notes && (
                              <p className="text-[10px] text-emerald-700 italic mt-1">
                                Engineers Note: {t.resolution_notes}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                t.priority === 'Urgent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : t.priority === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                t.status === 'Resolved' || t.status === 'Closed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'In Progress'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">
                            {formatDateTime(t.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* SUBMIT TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Submit Facility Request
              </h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Category *</label>
                <select
                  required
                  value={ticketForm.issue_category}
                  onChange={(e) => setTicketForm({ ...ticketForm, issue_category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Central AC">Central AC / Climate Control</option>
                  <option value="Electrical">Electrical Distribution / Lighting</option>
                  <option value="Plumbing">Plumbing / Sanitation</option>
                  <option value="Elevator">Elevator / Escalator Access</option>
                  <option value="Security">Security & Access Control</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Urgency Level *</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="Low">Low - General Checkup</option>
                  <option value="Medium">Medium - Regular Priority</option>
                  <option value="High">High - Impairing Operations</option>
                  <option value="Urgent">Urgent - Emergency Breakdown</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the problem, location in your unit, or abnormal sound/smell..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {activePrintInvoice && (
        <InvoicePrintModal
          invoice={activePrintInvoice}
          onClose={() => setActivePrintInvoice(null)}
        />
      )}
    </div>
  );
}
