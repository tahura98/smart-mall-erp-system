import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatBDT, formatDate } from '../../utils/formatters';
import {
  FileText,
  Plus,
  Search,
  Printer,
  CreditCard,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
  Zap,
  Calculator,
  Building,
  RefreshCw,
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import InvoicePrintModal from '../../components/common/InvoicePrintModal';

export default function AdminBilling({ onSelectInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const [units, setUnits] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Generate Invoice Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    unit_id: '',
    billing_month: 'January 2026',
    prev_meter_unit: '0',
    curr_meter_unit: '0',
    unit_rate: '12.50',
    vat_percentage: '5.00',
  });

  // Record Payment Modal
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'bKash Corporate',
    transaction_reference: '',
    paid_at: new Date().toISOString().split('T')[0],
  });

  // Print Modal
  const [printModalInvoice, setPrintModalInvoice] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, unitsRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/units'),
      ]);
      setInvoices(invRes.data?.invoices?.data || invRes.data?.invoices || []);
      setSummary(invRes.data?.summary || {});
      setUnits(unitsRes.data?.units?.data || unitsRes.data?.units || []);
    } catch (err) {
      console.error(err);
      notify('error', 'Error loading billing records.');
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

  // Open Generate Modal with smart defaults
  const handleOpenGenerate = () => {
    const curMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    setGenerateForm({
      unit_id: units[0]?.id || '',
      billing_month: curMonth,
      prev_meter_unit: '120.00',
      curr_meter_unit: '340.00',
      unit_rate: '12.50',
      vat_percentage: '5.00',
    });
    setShowGenerateModal(true);
  };

  // Selected unit for live math in modal
  const selectedUnit = units.find((u) => String(u.id) === String(generateForm.unit_id));
  const baseRent = Number(selectedUnit?.base_rent_bdt || 0);
  const camAmt = (Number(selectedUnit?.size_sqft || 0)) * (Number(selectedUnit?.cam_rate_per_sqft || 15));
  const electricityUnits = Math.max(0, Number(generateForm.curr_meter_unit || 0) - Number(generateForm.prev_meter_unit || 0));
  const electricityBill = electricityUnits * Number(generateForm.unit_rate || 12.50);
  const subTotal = baseRent + camAmt + electricityBill;
  const vatAmount = subTotal * (Number(generateForm.vat_percentage || 5) / 100);
  const grandTotal = subTotal + vatAmount;

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/invoices', {
        ...generateForm,
        rent_amount: baseRent,
        cam_charge: camAmt,
      });
      notify('success', `Invoice ${res.data?.invoice?.invoice_no} generated successfully.`);
      setShowGenerateModal(false);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Error generating bill.');
    }
  };

  const handleOpenPayment = (inv) => {
    setPaymentInvoice(inv);
    setPaymentForm({
      payment_method: 'bKash Corporate',
      transaction_reference: '',
      paid_at: new Date().toISOString().split('T')[0],
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/invoices/${paymentInvoice.id}/payment`, paymentForm);
      notify('success', `Payment confirmed for ${paymentInvoice.invoice_no}.`);
      setPaymentInvoice(null);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to record payment.');
    }
  };

  const handleMarkOverdue = async (inv) => {
    try {
      await api.post(`/invoices/${inv.id}/overdue`);
      notify('success', `Invoice ${inv.invoice_no} marked as Overdue.`);
      fetchData();
    } catch (err) {
      notify('error', err.response?.data?.message || 'Failed to update invoice.');
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchStatus = !filterStatus || inv.status === filterStatus;
    const matchMonth = !filterMonth || inv.billing_month === filterMonth;
    const matchSearch =
      !search ||
      inv.invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
      inv.unit?.unit_no?.toLowerCase().includes(search.toLowerCase()) ||
      inv.lease?.company_or_shop_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchMonth && matchSearch;
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

      {/* Header and Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Billing & Sub-Meter Utility Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-calculate CAM, electricity consumption, and commercial VAT in Bangladeshi Taka (৳).
          </p>
        </div>

        <button
          onClick={handleOpenGenerate}
          disabled={units.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Generate Monthly Bill
        </button>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Billed
          </span>
          <div className="text-xl font-black text-slate-900">
            {formatBDT(summary.total_billed_bdt)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Total Collected
          </span>
          <div className="text-xl font-black text-emerald-600">
            {formatBDT(summary.total_collected_bdt)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Pending Collection
          </span>
          <div className="text-xl font-black text-amber-600">
            {formatBDT(summary.total_unpaid_bdt)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
            Overdue Balance
          </span>
          <div className="text-xl font-black text-rose-600">
            {formatBDT(summary.total_overdue_bdt)}
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
              placeholder="Search Invoice #, Unit, Tenant..."
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
            <option value="">All Bill Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong>{filteredInvoices.length}</strong> Statements issued
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Commercial Bills Generated Yet"
          description="Use the 'Generate Monthly Bill' button to issue an itemized billing statement for rented shops and suites."
          actionText="Generate First Bill"
          onAction={handleOpenGenerate}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Demised Unit & Tenant</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-right">Rent (৳)</th>
                  <th className="py-3 px-4 text-right">CAM (৳)</th>
                  <th className="py-3 px-4 text-right">Electricity (৳)</th>
                  <th className="py-3 px-4 text-right">VAT 5% (৳)</th>
                  <th className="py-3 px-4 text-right">Total Payable (৳)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoice_no}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        Unit {inv.unit?.unit_no || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {inv.lease?.company_or_shop_name || 'Individual Lease'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {inv.billing_month}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
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
                    <td className="py-3 px-4 text-right font-black text-slate-950 text-sm">
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintModalInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          title="Print Official Tax Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
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

      {/* MODAL: GENERATE COMMERCIAL INVOICE */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                Generate Commercial Monthly Statement
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Unit *</label>
                  <select
                    required
                    value={generateForm.unit_id}
                    onChange={(e) => setGenerateForm({ ...generateForm, unit_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.unit_no} ({u.unit_type} • {u.size_sqft} sqft)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billing Month *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. January 2026"
                    value={generateForm.billing_month}
                    onChange={(e) => setGenerateForm({ ...generateForm, billing_month: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sub-Meter Electricity Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Sub-Meter Electricity Meter Reading (kWh)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Previous (kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={generateForm.prev_meter_unit}
                      onChange={(e) => setGenerateForm({ ...generateForm, prev_meter_unit: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Current (kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={generateForm.curr_meter_unit}
                      onChange={(e) => setGenerateForm({ ...generateForm, curr_meter_unit: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Unit Rate (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={generateForm.unit_rate}
                      onChange={(e) => setGenerateForm({ ...generateForm, unit_rate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200">
                  <span>Consumption: <strong>{electricityUnits.toFixed(2)} Units</strong></span>
                  <span>Calculated Bill: <strong className="text-slate-900">{formatBDT(electricityBill)}</strong></span>
                </div>
              </div>

              {/* VAT Field */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commercial VAT (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={generateForm.vat_percentage}
                    onChange={(e) => setGenerateForm({ ...generateForm, vat_percentage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">VAT Amount (৳)</label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold">
                    {formatBDT(vatAmount)}
                  </div>
                </div>
              </div>

              {/* Live Statement Summary Preview */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
                <div className="flex justify-between">
                  <span>Base Monthly Rent:</span>
                  <strong>{formatBDT(baseRent)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>CAM Charge (Sq. Ft. × ৳{selectedUnit?.cam_rate_per_sqft || 15}):</span>
                  <strong>{formatBDT(camAmt)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Electricity Bill:</span>
                  <strong>{formatBDT(electricityBill)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Commercial VAT ({generateForm.vat_percentage}%):</span>
                  <strong>{formatBDT(vatAmount)}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-300 text-sm font-black text-slate-950">
                  <span>Grand Total Payable:</span>
                  <span>{formatBDT(grandTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wider"
                >
                  Generate & Issue Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {paymentInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Record Remittance #{paymentInvoice.invoice_no}
              </h3>
              <button
                onClick={() => setPaymentInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Payable Balance</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {formatBDT(paymentInvoice.total_payable_bdt)}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Unit {paymentInvoice.unit?.unit_no} • {paymentInvoice.billing_month}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method *</label>
                <select
                  required
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="bKash Corporate">bKash Corporate</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash (Accounts Counter)</option>
                  <option value="Cheque">Cheque / Pay Order</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Ref / Cheque No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bKash TrxID #BL39420 or Cheque #928374"
                  value={paymentForm.transaction_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Settlement Date *</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paid_at}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paid_at: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider"
                >
                  Confirm & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {printModalInvoice && (
        <InvoicePrintModal
          invoice={printModalInvoice}
          onClose={() => setPrintModalInvoice(null)}
        />
      )}
    </div>
  );
}
