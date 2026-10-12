import React from 'react';

export function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', badge }) {
  const colorMap = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20',
    slate: 'from-slate-500/20 to-slate-500/5 text-slate-300 border-slate-500/20',
  };

  const iconBg = {
    emerald: 'bg-emerald-500/15 text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-400',
    rose: 'bg-rose-500/15 text-rose-400',
    purple: 'bg-purple-500/15 text-purple-400',
    blue: 'bg-blue-500/15 text-blue-400',
    slate: 'bg-slate-500/15 text-slate-300',
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden border">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorMap[color]} rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 opacity-70`}></div>
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
            {badge && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">{badge}</span>}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg[color] || iconBg.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
