import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@totalofficecenter.com');
  const [password, setPassword] = useState('Admin@1234');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.role === 'super_admin' || result.role === 'accounts_officer') {
          navigate('/admin', { replace: true });
        } else if (result.role === 'tenant') {
          navigate('/tenant', { replace: true });
        } else if (result.role === 'parking_operator') {
          navigate('/parking', { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden font-sans">
      {/* Architectural Ambient Gradient Background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-slate-900/60 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none translate-y-1/3"></div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10">
            <Building2 className="w-7 h-7" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Total Office Center
        </h1>
        <p className="mt-1 text-xs text-amber-400/90 font-bold tracking-widest uppercase">
          Commercial Complex & Shopping Mall ERP
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Dhaka Premier Real Estate & Facility Management Corporation
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl shadow-black/50 rounded-2xl border border-slate-200/80 sm:px-10">
          
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Staff & Tenant Sign-In
              </h2>
              <p className="text-[11px] text-slate-500">
                Authenticate with your corporate credentials
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              BDT ৳ System
            </span>
          </div>

          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@totalofficecenter.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Corporate Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-amber-400 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>Verifying Session...</>
              ) : (
                <>
                  Access ERP Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Official ERP Super Admin Credentials:</span>
            </div>

            <button
              type="button"
              onClick={() => quickFill('admin@totalofficecenter.com', 'Admin@1234')}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-amber-50/60 hover:border-amber-300 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="font-bold text-slate-800 block text-xs group-hover:text-amber-900">
                  TOC Super Admin
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  admin@totalofficecenter.com • Admin@1234
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 group-hover:bg-amber-200 group-hover:text-amber-900">
                Auto-fill
              </span>
            </button>
          </div>

        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Total Office Center Management ERP &bull; Version 2.0 (Bangladesh)
        </div>
      </div>
    </div>
  );
}
