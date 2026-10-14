import React, { useState } from 'react';
import { Search, Calendar, UploadCloud, RotateCcw, Check, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resetDatabase } from '../services/api';
import { OpenfabricLogo } from './OpenfabricLogo';

export function Header({
  onOpenSidebar,
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D1D8E6]/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Drawer Trigger + Brand Logo (< lg) + Tablet/Desktop Search */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Hamburger Button for Mobile / Tablet (< lg) */}
            <button
              onClick={onOpenSidebar}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-1 rounded-xl text-[#5B6487] hover:text-[#0F1B4C] hover:bg-[#EFF2F7] transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1EC8A5]/20"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Open Fabric Brand Badge (Shown when static sidebar is hidden: < lg) */}
            <Link
              to="/"
              className="lg:hidden flex items-center gap-2 shrink-0 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0F1B4C] p-1.5 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-[#1EC8A5]/10 group-hover:scale-105 transition-all">
                <OpenfabricLogo className="w-5 h-5" />
              </div>
              <div className="hidden xs:flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[#0F1B4C] text-sm tracking-tight leading-tight">
                    Open Fabric
                  </span>
                  <span className="status-dot-live" style={{ width: 6, height: 6 }}></span>
                </div>
                <span className="text-[9px] font-semibold text-[#5B6487] font-mono tracking-wider uppercase leading-none">
                  Reconcile Hub
                </span>
              </div>
            </Link>

            {/* Desktop & Tablet Search Bar (Hidden on mobile < sm, displayed inline on sm+) */}
            <div className="hidden sm:block relative flex-1 max-w-xs md:max-w-sm lg:max-w-md min-w-[160px]">
              <Search className="w-4 h-4 text-[#9EA5C7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Tx ID, Merchant, or Account..."
                className="w-full pl-9 pr-8 py-2 bg-[#EFF2F7] border border-[#D1D8E6] rounded-xl text-xs text-[#0F1B4C] placeholder-[#9EA5C7] focus:outline-none focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/15 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[#9EA5C7] hover:text-[#0F1B4C] hover:bg-[#D1D8E6] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Date Filter, DB Reset, Reconcile CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Evaluation Date Filter */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#EFF2F7] border border-[#D1D8E6] text-xs text-[#3A468F] hover:border-[#9EA5C7] transition-colors">
              <Calendar className="w-3.5 h-3.5 text-[#27A8E0] shrink-0" />
              <span className="hidden md:inline text-[#5B6487] font-medium text-[11px] sm:text-xs">
                {evaluationDate ? 'Date:' : 'Latest:'}
              </span>
              <input
                type="date"
                value={evaluationDate || ''}
                onChange={(e) => setEvaluationDate(e.target.value)}
                aria-label="Evaluation date"
                title={evaluationDate ? `Filtering by ${evaluationDate}` : 'Displaying latest database updates'}
                className="bg-transparent text-[#0F1B4C] font-mono text-[11px] sm:text-xs focus:outline-none cursor-pointer w-[92px] sm:w-auto"
              />
              {evaluationDate && (
                <button
                  onClick={() => setEvaluationDate('')}
                  title="Clear filter to view latest updates"
                  aria-label="Reset to latest date"
                  className="p-0.5 rounded text-[#9EA5C7] hover:text-[#0F1B4C] hover:bg-[#D1D8E6] transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Reset Database Button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset database to initial seed"
              aria-label="Reset database"
              className="p-2 rounded-xl border border-[#D1D8E6] bg-[#EFF2F7] hover:bg-white text-[#5B6487] hover:text-[#0F1B4C] hover:border-[#9EA5C7] transition-colors shrink-0 disabled:opacity-50"
            >
              {resetSuccess ? (
                <Check className="w-4 h-4 text-[#1EC8A5]" />
              ) : (
                <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              )}
            </button>

            {/* Reconcile New Data CTA Button — OpenFabric Teal */}
            <button
              onClick={onOpenReconcile}
              aria-label="Reconcile New Data"
              className="btn-brand inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs shrink-0 hover:scale-[1.02] active:scale-[0.97]"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.3] shrink-0" />
              <span className="hidden md:inline">Reconcile New Data</span>
              <span className="hidden xs:inline md:hidden">Reconcile</span>
            </button>
          </div>
        </div>

        {/* Mobile Dedicated Full-Width Search Bar (< sm / 640px) */}
        <div className="sm:hidden pb-2.5 pt-0.5">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#9EA5C7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Tx ID, Merchant, or Account..."
              className="w-full pl-9 pr-8 py-2 bg-[#EFF2F7] border border-[#D1D8E6] rounded-xl text-xs text-[#0F1B4C] placeholder-[#9EA5C7] focus:outline-none focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/15 focus:bg-white transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#9EA5C7] hover:text-[#0F1B4C] hover:bg-[#D1D8E6] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
