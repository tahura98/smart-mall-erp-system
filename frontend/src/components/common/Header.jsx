import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Shield, Store, LogOut, UserCheck } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, navTabs, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              isAdmin 
                ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-sky-500/20' 
                : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20'
            }`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">Smart Mall</span>
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isAdmin 
                    ? 'bg-sky-50 text-sky-700 border-sky-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {isAdmin ? 'Admin Console' : 'Shop Owner POS'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">{subtitle || 'Enterprise Commercial Mall Management'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          {navTabs && (
            <nav className="hidden md:flex space-x-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? isAdmin
                          ? 'bg-sky-50 text-sky-700 border border-sky-100 shadow-2xs'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {Icon && <Icon className={`w-4 h-4 ${isActive ? (isAdmin ? 'text-sky-600' : 'text-indigo-600') : 'text-slate-400'}`} />}
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{user?.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {navTabs && (
          <div className="md:hidden flex overflow-x-auto py-2 border-t border-slate-100 space-x-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    isActive ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'text-slate-600'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
