import React from 'react';
import { Store, Receipt, AlertCircle, PackageCheck, DollarSign, Users } from 'lucide-react';

export default function StatsCards({ shops, bills, products, sales, users }) {
  const totalShops = shops.length;
  const totalShopOwners = users.filter((u) => u.role === 'shop_owner').length;
  const totalMonthlyRentExpected = shops.reduce((sum, s) => sum + parseFloat(s.monthly_rent || 0), 0);
  const totalStockItems = products.reduce((sum, p) => sum + parseInt(p.stock || 0, 10), 0);
  const pendingBills = bills.filter((b) => b.status === 'pending' || b.status === 'unpaid');
  const pendingAmount = pendingBills.reduce(
    (sum, b) => sum + parseFloat(b.rent_amount || 0) + parseFloat(b.utility_bill || 0),
    0
  );
  const totalSalesRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

  const stats = [
    {
      label: 'Registered Shops',
      value: totalShops,
      subtitle: `${totalShopOwners} active owners across 3 floors`,
      icon: Store,
      color: 'from-blue-500 to-sky-600',
      bgColor: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      label: 'Monthly Rent Target',
      value: `$${totalMonthlyRentExpected.toLocaleString()}`,
      subtitle: 'Combined contractual lease',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      label: 'Pending / Due Bills',
      value: pendingBills.length,
      subtitle: `$${pendingAmount.toLocaleString()} awaiting clearance`,
      icon: AlertCircle,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      label: 'Total Products in Stock',
      value: totalStockItems.toLocaleString(),
      subtitle: `${products.length} catalog items managed`,
      icon: PackageCheck,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      label: 'Recorded Sales',
      value: `$${totalSalesRevenue.toLocaleString()}`,
      subtitle: `${sales.length} verified invoices`,
      icon: Receipt,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50 text-rose-700 border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg border ${stat.bgColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
