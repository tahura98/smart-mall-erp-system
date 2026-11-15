import React from 'react';
import { Building2, Shield, Store, Receipt, Package, DollarSign, Database, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentRole, setCurrentRole, dbConnected }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'shops', label: 'Shops Directory', icon: Store },
    { id: 'bills', label: 'Rent & Bills', icon: Receipt },
    { id: 'products', label: 'Products & Stock', icon: Package },
    { id: 'sales', label: 'Sales & Invoices', icon: DollarSign },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">Smart Mall</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500">Commercial Mall Management System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role Switcher & Database Pill */}
          <div className="flex items-center gap-3">
            {/* Database indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                dbConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title="Target: MySQL smart_mall_db"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">MySQL:</span>
              <span className="font-semibold">{dbConnected ? 'smart_mall_db' : 'smart_mall_db'}</span>
            </div>

            {/* Role switch toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                Admin
              </button>
              <button
                onClick={() => setCurrentRole('shop_owner')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'shop_owner'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                Shop Owner
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 border-t border-slate-100 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
