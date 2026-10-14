import React from 'react';

export function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'FULLY_SETTLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#E6FAF5] border border-[#B3F0E1] text-[#1EC8A5] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1EC8A5]"></span>
          Fully Settled
        </span>
      );
    case 'PARTIAL':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FFF8EB] border border-[#F5E2A8] text-[#E3A94B] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E3A94B]"></span>
          Partial
        </span>
      );
    case 'OVER_SETTLED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEF1EE] border border-[#F9C4B7] text-[#E8654A] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8654A]"></span>
          Over Settled
        </span>
      );
    case 'REFUNDED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#E8F6FC] border border-[#AED9F0] text-[#27A8E0] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#27A8E0]"></span>
          Refunded
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#EFF2F7] border border-[#D1D8E6] text-[#5B6487] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5B6487]"></span>
          Pending
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F7F9FC] border border-[#D1D8E6] text-[#9EA5C7] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5C9DE]"></span>
          Not Applicable
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-[#EFF2F7] text-[#5B6487] ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
