import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function IssueBadge({ severity, count = 0 }) {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          Critical Issue {count > 1 ? `(${count})` : ''}
        </span>
      );
    case 'WARNING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Warning {count > 1 ? `(${count})` : ''}
        </span>
      );
    case 'NONE':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Clear
        </span>
      );
  }
}
