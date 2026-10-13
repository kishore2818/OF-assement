import React from 'react';
import { Settings, Database, Calendar, Server, ShieldCheck } from 'lucide-react';

export function SettingsPage({ evaluationDate, setEvaluationDate }) {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#111827]">Engine Settings & Configuration</h1>
        <p className="text-sm text-[#64748B] mt-1">Configure evaluation parameters, database runtime options, and reconciliation thresholds.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            Default Evaluation Date
          </label>
          <input
            type="date"
            value={evaluationDate}
            onChange={(e) => setEvaluationDate(e.target.value)}
            className="w-full max-w-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#2563EB]"
          />
          <p className="text-xs text-[#64748B]">
            Controls the reference date used for flagging unsettled transactions exceeding the 7-day threshold.
          </p>
        </div>

        <div className="pt-4 border-t border-[#F1F5F9] space-y-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-[#64748B] block">
            Database Information
          </span>
          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <span className="text-[#64748B]">Engine</span>
            <span className="font-mono font-semibold text-[#111827]">better-sqlite3 v11</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <span className="text-[#64748B]">Foreign Keys</span>
            <span className="font-mono font-semibold text-[#16A34A]">PRAGMA foreign_keys = ON</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC]">
            <span className="text-[#64748B]">Precision Mode</span>
            <span className="font-mono font-semibold text-[#2563EB]">Integer-Cents (IEEE-754 Safe)</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[#64748B]">Matching Strategy</span>
            <span className="font-mono font-semibold text-[#111827]">Two-Tier (Lifecycle + Composite)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
