import React from 'react';
import { X, Printer, Building2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatBDT, formatDate, formatDateTime } from '../../utils/formatters';

export default function InvoicePrintModal({ invoice, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" /> Payment Pending
          </span>
        );
    }
  };

  const unitsConsumed = Math.max(0, Number(invoice.curr_meter_unit || 0) - Number(invoice.prev_meter_unit || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm text-slate-100">
              Commercial Invoice & Tax Receipt Preview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 sm:p-10 text-slate-800 print:p-0">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center text-amber-400 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  Total Office Center
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
                Premier Commercial Complex & Shopping Mall
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Plot #12-14, Commercial District, Gulshan-2, Dhaka-1212, Bangladesh<br />
                Tel: +880 2 9884123 • Email: billing@totalofficecenter.com<br />
                <strong>BIN / VAT Reg:</strong> 002847192-0101 • <strong>Trade License:</strong> TRAD/DNCC/028419/2026
              </p>
            </div>

            <div className="text-right flex flex-col items-start sm:items-end">
              <div className="mb-2">{getStatusBadge()}</div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Official Bill / Tax Receipt
              </h2>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <p><strong>Invoice No:</strong> <span className="font-mono text-slate-800">{invoice.invoice_no}</span></p>
                <p><strong>Billing Month:</strong> {invoice.billing_month}</p>
                <p><strong>Issued Date:</strong> {formatDate(invoice.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Billed To / Tenant Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Tenant Details)
              </span>
              <p className="text-sm font-bold text-slate-900">
                {invoice.lease?.company_or_shop_name || 'Commercial Tenant'}
              </p>
              <p className="text-slate-600 mt-0.5">
                <strong>Proprietor:</strong> {invoice.lease?.proprietor_name || 'N/A'}
              </p>
              <p className="text-slate-600">
                <strong>Phone:</strong> {invoice.lease?.phone_bd || 'N/A'}
              </p>
              <p className="text-slate-500 mt-1">
                <strong>Trade License:</strong> {invoice.lease?.trade_license_no || 'N/A'} • <strong>TIN:</strong> {invoice.lease?.tin_no || 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Demised Commercial Space
              </span>
              <p className="text-sm font-bold text-slate-900">
                Unit {invoice.unit?.unit_no || 'N/A'} ({invoice.unit?.unit_type || 'Office Suite'})
              </p>
              <p className="text-slate-600 mt-0.5">
                <strong>Floor / Level:</strong> {invoice.unit?.floor?.level_name || 'Ground Floor'} ({invoice.unit?.floor?.zone_type || 'Commercial'})
              </p>
              <p className="text-slate-600">
                <strong>Floor Area:</strong> {Number(invoice.unit?.size_sqft || 0).toLocaleString()} Sq. Ft.
              </p>
              <p className="text-slate-500 mt-1">
                <strong>Agreement No:</strong> {invoice.lease?.agreement_no || 'Active Commercial Lease'}
              </p>
            </div>
          </div>

          {/* Itemized Commercial Billing Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Billing Item Description</th>
                  <th className="py-3 px-4 text-center">Basis / Consumption</th>
                  <th className="py-3 px-4 text-right">Rate (BDT)</th>
                  <th className="py-3 px-4 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-500">1</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Base Commercial Space Rent</div>
                    <div className="text-[11px] text-slate-500">Monthly contract base rent for Unit {invoice.unit?.unit_no}</div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">1 Month</td>
                  <td className="py-3 px-4 text-right text-slate-600">—</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatBDT(invoice.rent_amount)}</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-500">2</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Common Area Maintenance (CAM)</div>
                    <div className="text-[11px] text-slate-500">Central AC, 24/7 Security, Escalators & Janitorial Services</div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">{Number(invoice.unit?.size_sqft || 0)} Sq. Ft.</td>
                  <td className="py-3 px-4 text-right text-slate-600">৳ {Number(invoice.unit?.cam_rate_per_sqft || 15).toFixed(2)}/sqft</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatBDT(invoice.cam_charge)}</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-500">3</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Sub-Meter Electricity Bill</div>
                    <div className="text-[11px] text-slate-500">
                      Meter Reading: {Number(invoice.prev_meter_unit).toFixed(2)} → {Number(invoice.curr_meter_unit).toFixed(2)} kWh
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">{unitsConsumed.toFixed(2)} Units</td>
                  <td className="py-3 px-4 text-right text-slate-600">৳ {Number(invoice.unit_rate || 12.50).toFixed(2)}/kWh</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatBDT(invoice.electricity_bill)}</td>
                </tr>

                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-500">4</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">Commercial VAT (Govt. of Bangladesh)</div>
                    <div className="text-[11px] text-slate-500">Standard statutory commercial tax</div>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">{Number(invoice.vat_percentage || 5).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right text-slate-600">—</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatBDT(invoice.vat_amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-slate-700">
                    Grand Total Payable (BDT):
                  </td>
                  <td className="py-3 px-4 text-right text-base text-slate-950 font-black">
                    {formatBDT(invoice.total_payable_bdt)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Information if Paid */}
          {invoice.status === 'Paid' && (
            <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Official Money Receipt & Settlement Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-800">
                <div>
                  <span className="text-slate-500">Payment Channel:</span>
                  <p className="font-bold text-emerald-900">{invoice.payment_method || 'Bank Transfer'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Transaction / Cheque Ref:</span>
                  <p className="font-mono font-bold text-emerald-900">{invoice.transaction_reference || 'TOC-CONFIRMED'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Settled On:</span>
                  <p className="font-bold text-emerald-900">{formatDateTime(invoice.paid_at || invoice.updated_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Terms & Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * Payment is strictly due by the 10th of every calendar month. Please send all electronic remittances via Bank Transfer or bKash Corporate with your Demised Unit number as the narration. Late payments incur a 2% monthly statutory service charge.
            </p>

            <div className="grid grid-cols-2 gap-12 mt-12 pt-6 text-center text-xs text-slate-600">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">Prepared By (Accounts Dept)</p>
                <p className="text-[10px] text-slate-500">Total Office Center ERP</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">Authorized Officer & Official Seal</p>
                <p className="text-[10px] text-slate-500">Management Corporation</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
