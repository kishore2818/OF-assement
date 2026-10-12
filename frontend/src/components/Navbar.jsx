import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Layers,
  BarChart3,
  ListFilter,
  UploadCloud,
  RotateCcw,
  Download,
  Calendar,
  Check
} from 'lucide-react';
import { resetDatabase, getExportUrl } from '../services/api';

export function Navbar({ onOpenReconcile, evaluationDate, setEvaluationDate, onDataReset }) {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset database back to original un-reconciled seed state?')) return;
    try {
      setResetting(true);
      await resetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
      if (onDataReset) onDataReset();
    } catch (err) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-800 text-emerald-400 font-semibold shadow-inner'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              FinOps <span className="text-emerald-400 font-normal">Reconcile</span>
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-slate-400 -mt-1 font-mono">
              Transaction Engine v1.0
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={navLinkClass}>
            <ListFilter className="w-4 h-4" />
            Transactions
          </NavLink>
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-3">
          {/* Evaluation Date badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Eval Date:</span>
            <input
              type="date"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              className="bg-transparent text-emerald-400 font-mono text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Export CSV button */}
          <a
            href={getExportUrl()}
            download
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            title="Export transactions report as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>

          {/* Reset DB Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Reset database back to initial seed data"
          >
            {resetSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Reset!</span>
              </>
            ) : (
              <>
                <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${resetting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reset DB</span>
              </>
            )}
          </button>

          {/* Run Reconciliation Button */}
          <button
            onClick={onOpenReconcile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Reconcile CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
