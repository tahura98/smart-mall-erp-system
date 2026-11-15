import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import api from '../../api/axios';
import { initialData } from '../../data/mockData';
import {
  Store,
  Receipt,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Plus,
  Search,
  MapPin,
  User,
  Calendar,
  LayoutDashboard,
  Clock,
  Trash2,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'shops' | 'billing'

  // Data states
  const [shops, setShops] = useState(initialData.shops);
  const [bills, setBills] = useState(initialData.bills);
  const [users, setUsers] = useState(initialData.users);

  // Modals
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [showAddBillModal, setShowAddBillModal] = useState(false);

  // Search & Filter
  const [shopSearch, setShopSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState('all');
  const [billSearch, setBillSearch] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState('all');

  // New Shop Form State
  const [shopForm, setShopForm] = useState({
    shop_number: '',
    floor_name: 'Ground Floor',
    shop_name: '',
    owner_id: 2,
    monthly_rent: '',
  });

  // New Bill Form State
  const [billForm, setBillForm] = useState({
    shop_id: 1,
    month_year: '2024-11',
    rent_amount: '',
    utility_bill: '',
    status: 'pending',
  });

  // Try fetching live data from backend with graceful fallback
  useEffect(() => {
    api.get('/admin/shops')
      .then((res) => {
        if (res.data?.data) setShops(res.data.data);
      })
      .catch(() => {});

    api.get('/admin/bills')
      .then((res) => {
        if (res.data?.data) setBills(res.data.data);
      })
      .catch(() => {});
  }, []);

  // Summary Metrics calculations
  const totalShops = shops.length;
  const totalRentTarget = shops.reduce((sum, s) => sum + parseFloat(s.monthly_rent || 0), 0);
  
  // Paid rent + utilities
  const collectedBills = bills.filter((b) => b.status === 'paid');
  const totalCollectedRent = collectedBills.reduce(
    (sum, b) => sum + parseFloat(b.rent_amount || 0) + parseFloat(b.utility_bill || 0),
    0
  );

  // Due / Unpaid / Pending rent + utilities
  const dueBills = bills.filter((b) => b.status === 'unpaid' || b.status === 'pending');
  const totalDueRent = dueBills.reduce(
    (sum, b) => sum + parseFloat(b.rent_amount || 0) + parseFloat(b.utility_bill || 0),
    0
  );

  // Shop filtering
  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.shop_name.toLowerCase().includes(shopSearch.toLowerCase()) ||
      shop.shop_number.toLowerCase().includes(shopSearch.toLowerCase()) ||
      (shop.owner_name && shop.owner_name.toLowerCase().includes(shopSearch.toLowerCase()));
    const matchesFloor = floorFilter === 'all' || shop.floor_name === floorFilter;
    return matchesSearch && matchesFloor;
  });

  // Bill filtering
  const filteredBills = bills.filter((bill) => {
    const matchesStatus = billStatusFilter === 'all' || bill.status === billStatusFilter;
    const matchesSearch =
      (bill.shop_name && bill.shop_name.toLowerCase().includes(billSearch.toLowerCase())) ||
      bill.month_year.toLowerCase().includes(billSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle Add Shop
  const handleAddShop = async (e) => {
    e.preventDefault();
    const owner = users.find((u) => u.id === parseInt(shopForm.owner_id, 10));
    const newShop = {
      id: Date.now(),
      shop_number: shopForm.shop_number,
      floor_name: shopForm.floor_name,
      shop_name: shopForm.shop_name,
      owner_id: parseInt(shopForm.owner_id, 10),
      owner_name: owner?.name || 'Shop Owner',
      monthly_rent: parseFloat(shopForm.monthly_rent),
    };

    // Try posting to API
    try {
      const res = await api.post('/admin/shops', shopForm);
      if (res.data?.data) {
        setShops([res.data.data, ...shops]);
      } else {
        setShops([newShop, ...shops]);
      }
    } catch {
      setShops([newShop, ...shops]);
    }

    setShowAddShopModal(false);
    setShopForm({
      shop_number: '',
      floor_name: 'Ground Floor',
      shop_name: '',
      owner_id: users.find((u) => u.role === 'shop_owner')?.id || 2,
      monthly_rent: '',
    });
  };

  // Handle Toggle Bill Status (Paid vs Due)
  const handleToggleBillStatus = async (billId, targetStatus) => {
    try {
      await api.put(`/admin/bills/${billId}`, { status: targetStatus });
    } catch {
      // Fallback local update
    }
    setBills(bills.map((b) => (b.id === billId ? { ...b, status: targetStatus } : b)));
  };

  // Handle Add Bill
  const handleAddBill = async (e) => {
    e.preventDefault();
    const shop = shops.find((s) => s.id === parseInt(billForm.shop_id, 10));
    const newBill = {
      id: Date.now(),
      shop_id: parseInt(billForm.shop_id, 10),
      shop_name: shop ? shop.shop_name : `Shop #${billForm.shop_id}`,
      month_year: billForm.month_year,
      rent_amount: parseFloat(billForm.rent_amount || shop?.monthly_rent || 0),
      utility_bill: parseFloat(billForm.utility_bill || 0),
      status: billForm.status,
    };

    try {
      const res = await api.post('/admin/bills', billForm);
      if (res.data?.data) {
        setBills([res.data.data, ...bills]);
      } else {
        setBills([newBill, ...bills]);
      }
    } catch {
      setBills([newBill, ...bills]);
    }

    setShowAddBillModal(false);
  };

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'shops', label: 'Shops Directory', icon: Store },
    { id: 'billing', label: 'Billing & Rent Ledger', icon: Receipt },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navTabs={navTabs}
        subtitle="Mall Administration & Tenant Billing Control"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards: Total Shops, Collected vs Due Rent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Shops</span>
              <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900">{totalShops}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Across Ground, 1st & 2nd floors</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Collected Rent</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-emerald-600">
                ${totalCollectedRent.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{collectedBills.length} invoices cleared</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Due / Pending Rent</span>
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-rose-600">
                ${totalDueRent.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{dueBills.length} bills awaiting collection</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Contractual Monthly Base</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-indigo-700">
                ${totalRentTarget.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Standard baseline lease volume</p>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: EXECUTIVE OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Shops Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Registered Mall Shops</h3>
                    <p className="text-xs text-slate-500">Active retail and cafe tenants</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('shops')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    Manage All ({shops.length}) &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {shops.slice(0, 4).map((shop) => (
                    <div key={shop.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-700 border border-slate-200">
                          {shop.shop_number}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{shop.shop_name}</div>
                          <div className="text-xs text-slate-500">{shop.floor_name} &bull; {shop.owner_name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600">
                          ${parseFloat(shop.monthly_rent).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">Monthly Lease</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outstanding Rent Alerts Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Rent & Utility Collections</h3>
                    <p className="text-xs text-slate-500">Quick status clearance tracker</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    View Billing Ledger &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {bills.slice(0, 4).map((bill) => {
                    const total = parseFloat(bill.rent_amount) + parseFloat(bill.utility_bill);
                    return (
                      <div key={bill.id} className="py-3.5 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{bill.shop_name}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            Month: {bill.month_year} &bull; Utility: ${parseFloat(bill.utility_bill).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">${total.toLocaleString()}</div>
                            <span
                              className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                bill.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : bill.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {bill.status}
                            </span>
                          </div>
                          {bill.status !== 'paid' && (
                            <button
                              onClick={() => handleToggleBillStatus(bill.id, 'paid')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-2xs"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SHOPS MANAGEMENT ================= */}
        {activeTab === 'shops' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by shop name, number or owner..."
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">All Floors</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="First Floor">First Floor</option>
                  <option value="Second Floor">Second Floor</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddShopModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Shop
              </button>
            </div>

            {/* Shops Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Shop Number & Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Floor Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Assigned Owner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Monthly Rent
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredShops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-800">
                              {shop.shop_number}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{shop.shop_name}</div>
                              <div className="text-xs text-slate-400">ID #{shop.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                            <MapPin className="w-3.5 h-3.5 text-sky-500" />
                            {shop.floor_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-800">{shop.owner_name || `Owner #${shop.owner_id}`}</div>
                          <div className="text-xs text-slate-400">Authorized Tenant</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-emerald-600">
                            ${parseFloat(shop.monthly_rent).toLocaleString()} /mo
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active Lease
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BILLING MANAGEMENT ================= */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by shop or month..."
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['all', 'paid', 'unpaid', 'pending'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBillStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                        billStatusFilter === st
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st === 'unpaid' ? 'Due' : st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowAddBillModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Generate Monthly Bill
              </button>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Invoice ID & Month
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Shop Store
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Rent Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Utility Bill
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Quick Mark Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredBills.map((bill) => {
                      const total = parseFloat(bill.rent_amount) + parseFloat(bill.utility_bill);
                      return (
                        <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-slate-900">BILL-#{bill.id}</div>
                            <div className="text-xs text-slate-400 font-mono">{bill.month_year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-900">{bill.shop_name}</div>
                            <div className="text-xs text-slate-400">Shop ID #{bill.shop_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                            ${parseFloat(bill.rent_amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                            ${parseFloat(bill.utility_bill).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-extrabold text-slate-900">
                              ${total.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                bill.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : bill.status === 'unpaid'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {bill.status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              {bill.status === 'unpaid' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                              {bill.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                              {bill.status === 'unpaid' ? 'Due' : bill.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {bill.status !== 'paid' && (
                                <button
                                  onClick={() => handleToggleBillStatus(bill.id, 'paid')}
                                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors"
                                >
                                  Mark as Paid
                                </button>
                              )}
                              {bill.status !== 'unpaid' && (
                                <button
                                  onClick={() => handleToggleBillStatus(bill.id, 'unpaid')}
                                  className="px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors"
                                >
                                  Mark as Due
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
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD SHOP ================= */}
      {showAddShopModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Shop Store</h3>
              <button
                onClick={() => setShowAddShopModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddShop} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prestige Timepieces"
                  value={shopForm.shop_name}
                  onChange={(e) => setShopForm({ ...shopForm, shop_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Shop Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. F2-320"
                    value={shopForm.shop_number}
                    onChange={(e) => setShopForm({ ...shopForm, shop_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Floor Name
                  </label>
                  <select
                    value={shopForm.floor_name}
                    onChange={(e) => setShopForm({ ...shopForm, floor_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="First Floor">First Floor</option>
                    <option value="Second Floor">Second Floor</option>
                    <option value="Third Floor">Third Floor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Assigned Shop Owner (owner_id)
                </label>
                <select
                  value={shopForm.owner_id}
                  onChange={(e) => setShopForm({ ...shopForm, owner_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
                >
                  {users
                    .filter((u) => u.role === 'shop_owner')
                    .map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Monthly Rent Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="50000"
                  value={shopForm.monthly_rent}
                  onChange={(e) => setShopForm({ ...shopForm, monthly_rent: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddShopModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Create Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD BILL ================= */}
      {showAddBillModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Generate Monthly Bill</h3>
              <button
                onClick={() => setShowAddBillModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBill} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Shop (shop_id)
                </label>
                <select
                  value={billForm.shop_id}
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    const s = shops.find((item) => item.id === id);
                    setBillForm({
                      ...billForm,
                      shop_id: id,
                      rent_amount: s ? s.monthly_rent : '',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shop_number} &bull; {s.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Billing Period (month_year)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024-11"
                  value={billForm.month_year}
                  onChange={(e) => setBillForm({ ...billForm, month_year: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Rent Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="45000"
                    value={billForm.rent_amount}
                    onChange={(e) => setBillForm({ ...billForm, rent_amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Utility Bill ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5200"
                    value={billForm.utility_bill}
                    onChange={(e) => setBillForm({ ...billForm, utility_bill: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={billForm.status}
                  onChange={(e) => setBillForm({ ...billForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="unpaid">Due (Unpaid)</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBillModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
