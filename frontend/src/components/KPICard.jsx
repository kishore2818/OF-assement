import React from 'react';

export function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', badge }) {
  const iconColors = {
    emerald: 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]',
    amber: 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]',
    rose: 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]',
    purple: 'bg-[#FAF5FF] text-[#9333EA] border-[#F3E8FF]',
    blue: 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]',
    slate: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider uppercase text-[#64748B]">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold tracking-tight text-[#111827]">{value}</h3>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] font-medium">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconColors[color] || iconColors.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
