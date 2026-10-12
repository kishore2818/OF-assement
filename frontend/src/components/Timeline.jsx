import React from 'react';
import { CircleDot, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function Timeline({ events = [] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-slate-500 italic">No historical timeline events available.</p>;
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'TRANSACTION_INITIATED':
        return <CircleDot className="w-4 h-4 text-sky-400" />;
      case 'SETTLEMENT_DEBIT':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'SETTLEMENT_CREDIT':
        return <ArrowUpRight className="w-4 h-4 text-purple-400" />;
      case 'RECONCILED':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'TRANSACTION_INITIATED':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'SETTLEMENT_DEBIT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SETTLEMENT_CREDIT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'RECONCILED':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events.map((event, idx) => (
        <div key={idx} className="relative group">
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            {getEventIcon(event.type)}
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-md border font-mono font-medium ${getEventBadge(event.type)}`}>
                {event.date}
              </span>
              {event.amount !== undefined && (
                <span className="text-sm font-semibold font-mono text-white">
                  ${Number(event.amount).toFixed(2)}
                </span>
              )}
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mt-2">{event.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
