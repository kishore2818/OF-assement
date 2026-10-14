import React from 'react';
import { CircleDot, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function Timeline({ events = [] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-slate-400 italic">No historical timeline events available.</p>;
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'TRANSACTION_INITIATED':
        return <CircleDot className="w-4 h-4 text-[#1EC8A5]" />;
      case 'SETTLEMENT_DEBIT':
        return <ArrowDownLeft className="w-4 h-4 text-[#059669]" />;
      case 'SETTLEMENT_CREDIT':
        return <ArrowUpRight className="w-4 h-4 text-[#7C3AED]" />;
      case 'RECONCILED':
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#059669]" />;
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'TRANSACTION_INITIATED':
        return 'bg-[#E6FAF5] text-[#1EC8A5] border-[#B3F0E1]';
      case 'SETTLEMENT_DEBIT':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'SETTLEMENT_CREDIT':
        return 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]';
      case 'RECONCILED':
      default:
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs">
            {getEventIcon(event.type)}
          </div>
          <div className="bg-[#F7F9FC] border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-md border font-mono font-medium ${getEventBadge(event.type)}`}>
                {event.date}
              </span>
              {event.amount !== undefined && (
                <span className="text-sm font-semibold font-mono text-[#0F1B4C]">
                  ${Number(event.amount).toFixed(2)}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-[#0F1B4C] mt-2">{event.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
