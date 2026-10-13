import React from 'react';

export function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'FULLY_SETTLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
          Fully Settled
        </span>
      );
    case 'PARTIAL':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] border border-[#FEF3C7] text-[#D97706] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
          Partial
        </span>
      );
    case 'OVER_SETTLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
          Over Settled
        </span>
      );
    case 'REFUNDED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FAF5FF] border border-[#F3E8FF] text-[#9333EA] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]"></span>
          Refunded
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
          Pending
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#94A3B8] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
          Not Applicable
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-[#F1F5F9] text-[#64748B] ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
