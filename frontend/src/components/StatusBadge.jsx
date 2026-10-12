import React from 'react';

export function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'FULLY_SETTLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Fully Settled
        </span>
      );
    case 'PARTIAL':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Partial
        </span>
      );
    case 'OVER_SETTLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Over Settled
        </span>
      );
    case 'REFUNDED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          Refunded
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 border border-slate-500/30 text-slate-400 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Pending
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/40 text-zinc-400 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
          Not Applicable
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-400 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
