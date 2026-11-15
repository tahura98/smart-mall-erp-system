import React, { useState } from 'react';
import { Receipt, CheckCircle, Clock, AlertCircle, Plus, Search, Filter } from 'lucide-react';

export default function BillsView({ bills, setBills, shops, currentRole }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    shop_id: shops[0]?.id || 1,
    month_year: '2024-11',
    rent_amount: '',
    utility_bill: '',
    status: 'pending',
  });

  const filteredBills = bills.filter((bill) => {
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const matchesSearch =
      (bill.shop_name && bill.shop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      bill.month_year.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (billId, newStatus) => {
    setBills(
      bills.map((b) => (b.id === billId ? { ...b, status: newStatus } : b))
    );
  };

  const handleCreateBill = (e) => {
    e.preventDefault();
    const selectedShop = shops.find((s) => s.id === parseInt(formData.shop_id, 10));
    const newBill = {
      id: Date.now(),
      shop_id: parseInt(formData.shop_id, 10),
      shop_name: selectedShop ? selectedShop.shop_name : `Shop #${formData.shop_id}`,
      month_year: formData.month_year,
      rent_amount: parseFloat(formData.rent_amount || selectedShop?.monthly_rent || 0),
      utility_bill: parseFloat(formData.utility_bill || 0),
      status: formData.status,
    };

    setBills([newBill, ...bills]);
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Overdue / Unpaid
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by shop or month (YYYY-MM)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['all', 'paid', 'pending', 'unpaid'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Monthly Bill
          </button>
        )}
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Bill ID & Month
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Rent Amount
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Utility Bill
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Payable
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredBills.map((bill) => {
                const total = parseFloat(bill.rent_amount) + parseFloat(bill.utility_bill);
                return (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">#{bill.id}</div>
                      <div className="text-xs text-slate-500 font-mono">{bill.month_year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-800">{bill.shop_name}</div>
                      <div className="text-xs text-slate-400">Shop ID: {bill.shop_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                      ${parseFloat(bill.rent_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                      ${parseFloat(bill.utility_bill).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">
                        ${total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1.5">
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => handleStatusChange(bill.id, 'paid')}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-md transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        {bill.status !== 'unpaid' && (
                          <button
                            onClick={() => handleStatusChange(bill.id, 'unpaid')}
                            className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-md transition-colors"
                          >
                            Mark Due
                          </button>
                        )}
                        {bill.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(bill.id, 'pending')}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            Pending
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Bill */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Generate Shop Bill</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Target Shop (shop_id)
                </label>
                <select
                  value={formData.shop_id}
                  onChange={(e) => {
                    const sId = parseInt(e.target.value, 10);
                    const sel = shops.find((s) => s.id === sId);
                    setFormData({
                      ...formData,
                      shop_id: sId,
                      rent_amount: sel ? sel.monthly_rent : '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.shop_number} - {shop.shop_name} (${parseFloat(shop.monthly_rent).toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Billing Period (month_year)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024-11 or December 2024"
                  value={formData.month_year}
                  onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Rent Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="45000"
                    value={formData.rent_amount}
                    onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Utility Bill ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5200"
                    value={formData.utility_bill}
                    onChange={(e) => setFormData({ ...formData, utility_bill: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="unpaid">Unpaid / Due</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
