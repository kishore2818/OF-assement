import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function IssueBadge({ severity, count = 0 }) {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
          <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
          Critical Issue {count > 1 ? `(${count})` : ''}
        </span>
      );
    case 'WARNING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
          Warning {count > 1 ? `(${count})` : ''}
        </span>
      );
    case 'NONE':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          Clear
        </span>
      );
  }
}
