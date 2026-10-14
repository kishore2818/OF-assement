import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OpenfabricLogo } from '../components/OpenfabricLogo';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 font-sans">
      
      {/* Subtle Background Radial Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none"></div>

      {/* Clean Minimalist Card */}
      <div className="w-full max-w-md z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm p-2 mb-1">
            <OpenfabricLogo className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Open Fabric</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Transaction Reconciliation Portal</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          
          <div className="border-b border-slate-100 pb-4 text-center">
            <h2 className="text-lg font-bold text-slate-900">Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your credentials to access the ledger console</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-700 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@openfabric.co"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono focus:bg-white focus:outline-none focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0F1B4C] hover:bg-[#1A2B6B] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer pt-2.5"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.3]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1EC8A5]" />
            <span>Encrypted JWT Session • Reconcile Console</span>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Open Fabric Systems &copy; 2026. All rights reserved.
        </p>
      </div>
    </div>
  );
}
