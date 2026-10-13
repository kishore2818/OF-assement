import React, { useState } from 'react';
import { Search, Calendar, UploadCloud, RotateCcw, Check } from 'lucide-react';
import { resetDatabase } from '../services/api';

export function Header({
  search,
  setSearch,
  evaluationDate,
  setEvaluationDate,
  onOpenReconcile,
  onDataReset
}) {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset database back to initial seed state?')) return;
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

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Transaction ID, Merchant, or Account..."
          className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-colors"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Date Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569]">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span className="text-[#64748B]">Date:</span>
          <input
            type="date"
            value={evaluationDate}
            onChange={(e) => setEvaluationDate(e.target.value)}
            className="bg-transparent text-[#111827] font-mono text-xs focus:outline-none cursor-pointer"
          />
        </div>

        {/* Reset DB Button */}
        <button
          onClick={handleReset}
          disabled={resetting}
          title="Reset database to initial seed"
          className="p-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#111827] transition-colors"
        >
          {resetSuccess ? (
            <Check className="w-4 h-4 text-[#16A34A]" />
          ) : (
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          )}
        </button>

        {/* Prominent “Reconcile New Data” button */}
        <button
          onClick={onOpenReconcile}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-[#2563EB]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" />
          <span>Reconcile New Data</span>
        </button>
      </div>
    </header>
  );
}
