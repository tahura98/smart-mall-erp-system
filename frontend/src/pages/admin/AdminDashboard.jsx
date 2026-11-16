import React, { useState } from 'react';
import Header from '../../components/common/Header';
import AdminOverview from './AdminOverview';
import AdminDirectory from './AdminDirectory';
import AdminLeases from './AdminLeases';
import AdminBilling from './AdminBilling';
import AdminMaintenance from './AdminMaintenance';
import AdminParking from './AdminParking';
import InvoicePrintModal from '../../components/common/InvoicePrintModal';
import {
  LayoutDashboard,
  Layers,
  FileCheck,
  Receipt,
  Wrench,
  Car,
} from 'lucide-react';

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [activePrintInvoice, setActivePrintInvoice] = useState(null);

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Space & Floors', icon: Layers },
    { id: 'leases', label: 'Tenants & Leases', icon: FileCheck },
    { id: 'billing', label: 'Billing & Utilities', icon: Receipt },
    { id: 'maintenance', label: 'Maintenance Desk', icon: Wrench },
    { id: 'parking', label: 'Basement Parking', icon: Car },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Architectural Header */}
      <Header currentSection={currentTab} onNavigate={setCurrentTab} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 mb-6 shadow-sm flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <main className="flex-1">
          {currentTab === 'overview' && (
            <AdminOverview
              onNavigate={setCurrentTab}
              onSelectInvoice={(inv) => setActivePrintInvoice(inv)}
            />
          )}

          {currentTab === 'directory' && <AdminDirectory />}

          {currentTab === 'leases' && <AdminLeases />}

          {currentTab === 'billing' && (
            <AdminBilling
              onSelectInvoice={(inv) => setActivePrintInvoice(inv)}
            />
          )}

          {currentTab === 'maintenance' && <AdminMaintenance />}

          {currentTab === 'parking' && <AdminParking />}
        </main>
      </div>

      {/* Printable Invoice / Money Receipt Modal */}
      {activePrintInvoice && (
        <InvoicePrintModal
          invoice={activePrintInvoice}
          onClose={() => setActivePrintInvoice(null)}
        />
      )}
    </div>
  );
}
