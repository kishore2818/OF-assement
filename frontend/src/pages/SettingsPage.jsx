import React from 'react';
import { Calendar } from 'lucide-react';

export function SettingsPage({ evaluationDate, setEvaluationDate }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Engine Settings & Configuration</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Configure evaluation parameters, database runtime options, and reconciliation thresholds.</p>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#1EC8A5]" />
            Default Evaluation Date
          </label>
          <input
            type="date"
            value={evaluationDate}
            onChange={(e) => setEvaluationDate(e.target.value)}
            className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/10"
          />
          <p className="text-xs text-slate-500">
            Controls the reference date used for flagging unsettled transactions exceeding the 7-day threshold.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-500 block">
            Database Information
          </span>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Engine</span>
            <span className="font-mono font-semibold text-slate-900">better-sqlite3 v11</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Foreign Keys</span>
            <span className="font-mono font-semibold text-[#059669]">PRAGMA foreign_keys = ON</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Precision Mode</span>
            <span className="font-mono font-semibold text-[#1EC8A5]">Integer-Cents (IEEE-754 Safe)</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500">Matching Strategy</span>
            <span className="font-mono font-semibold text-slate-900">Two-Tier (Lifecycle + Composite)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
