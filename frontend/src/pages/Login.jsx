import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, Store, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@smartmall.com');
  const [password, setPassword] = useState('password123');
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
        if (result.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/owner', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Icon & Heading */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/25">
            <Building2 className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Smart Mall Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-medium">
          Commercial Management System &bull; Laravel Sanctum + React
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/80 sm:px-10">
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartmall.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-sky-600 hover:underline cursor-pointer">
                  Default: password123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Authenticating with Sanctum...</span>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Accounts (1-Click Fill)
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFill('admin@smartmall.com', 'admin')}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  email === 'admin@smartmall.com'
                    ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold text-sky-800">
                  <Shield className="w-3.5 h-3.5 text-sky-600" />
                  Admin
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">
                  admin@smartmall.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('alex@urbanthreads.com', 'shop_owner')}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  email === 'alex@urbanthreads.com'
                    ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-800">
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  Shop Owner
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">
                  alex@urbanthreads.com
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Role-protected routes automatically guarded by Laravel Sanctum
        </p>
      </div>
    </div>
  );
}
