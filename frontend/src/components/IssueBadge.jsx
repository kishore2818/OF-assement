import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function IssueBadge({ severity, count = 0 }) {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
          <AlertCircle className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
          <span>Critical Issue {count > 1 ? `(${count})` : ''}</span>
        </span>
      );
    case 'WARNING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>Warning {count > 1 ? `(${count})` : ''}</span>
        </span>
      );
    case 'NONE':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
          <span>Clear</span>
        </span>
      );
  }
}
