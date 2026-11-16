import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogOut, User, ShieldCheck, Banknote } from 'lucide-react';

export default function Header({ currentSection, onNavigate }) {
  const { user, logout, role } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'accounts_officer':
        return { label: 'Accounts Officer', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'tenant':
        return { label: 'Tenant Account', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'parking_operator':
        return { label: 'Parking Operator', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      default:
        return { label: 'Portal User', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl shadow-slate-950/20">
      {/* Top subtle gold accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Complex Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-black/40">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-wider text-white uppercase font-sans">
                  Total Office Center
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide hidden sm:block">
                Dhaka Premier Commercial Complex & Mall System
              </p>
            </div>
          </div>

          {/* Right Section: Currency Badge, User Info, Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Currency Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium">
              <Banknote className="w-3.5 h-3.5 text-amber-400" />
              <span>Currency:</span>
              <strong className="text-amber-400 font-semibold">BDT (৳)</strong>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white tracking-tight flex items-center justify-end gap-1.5">
                  {user?.name || 'Authorized User'}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                  <span className={`inline-block px-1.5 py-0.2 rounded border text-[10px] font-semibold ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-sm shadow-inner">
                {user?.name?.charAt(0) || 'U'}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign out of TOC ERP"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
