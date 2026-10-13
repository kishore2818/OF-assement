import React from 'react';
import { CircleDot, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function Timeline({ events = [] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-[#94A3B8] italic">No historical timeline events available.</p>;
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'TRANSACTION_INITIATED':
        return <CircleDot className="w-4 h-4 text-[#2563EB]" />;
      case 'SETTLEMENT_DEBIT':
        return <ArrowDownLeft className="w-4 h-4 text-[#16A34A]" />;
      case 'SETTLEMENT_CREDIT':
        return <ArrowUpRight className="w-4 h-4 text-[#9333EA]" />;
      case 'RECONCILED':
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />;
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'TRANSACTION_INITIATED':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]';
      case 'SETTLEMENT_DEBIT':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
      case 'SETTLEMENT_CREDIT':
        return 'bg-[#FAF5FF] text-[#9333EA] border-[#F3E8FF]';
      case 'RECONCILED':
      default:
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
      {events.map((event, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center shadow-xs">
            {getEventIcon(event.type)}
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 transition-all hover:border-[#CBD5E1]">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-md border font-mono font-medium ${getEventBadge(event.type)}`}>
                {event.date}
              </span>
              {event.amount !== undefined && (
                <span className="text-sm font-semibold font-mono text-[#111827]">
                  ${Number(event.amount).toFixed(2)}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-[#111827] mt-2">{event.title}</h4>
            <p className="text-xs text-[#64748B] mt-0.5">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
