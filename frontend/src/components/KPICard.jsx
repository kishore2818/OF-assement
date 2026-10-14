import React from 'react';

export function KPICard({ title, value, subtitle, icon: Icon, color = 'teal', badge }) {
  const iconColors = {
    teal:   'bg-[#E6FAF5] text-[#1EC8A5] border-[#B3F0E1]',
    blue:   'bg-[#E8F6FC] text-[#27A8E0] border-[#AED9F0]',
    coral:  'bg-[#FEF1EE] text-[#E8654A] border-[#F9C4B7]',
    gold:   'bg-[#FFF8EB] text-[#E3A94B] border-[#F5E2A8]',
    navy:   'bg-[#E8EAF2] text-[#0F1B4C] border-[#C5C9DE]',
    slate:  'bg-[#EFF2F7] text-[#5B6487] border-[#D1D8E6]',
    // Legacy aliases for backward compatibility
    emerald: 'bg-[#E6FAF5] text-[#1EC8A5] border-[#B3F0E1]',
    amber:   'bg-[#FFF8EB] text-[#E3A94B] border-[#F5E2A8]',
    rose:    'bg-[#FEF1EE] text-[#E8654A] border-[#F9C4B7]',
    purple:  'bg-[#E8F6FC] text-[#27A8E0] border-[#AED9F0]',
    indigo:  'bg-[#E6FAF5] text-[#1EC8A5] border-[#B3F0E1]',
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D1D8E6] shadow-card hover:shadow-card-hover hover:border-[#1EC8A5]/25 transition-all duration-300 relative overflow-hidden group">
      {/* Subtle accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#1EC8A5] via-[#27A8E0] to-[#1EC8A5] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#5B6487] truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F1B4C]">
              {value}
            </h3>
            {badge && (
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#5B6487] font-medium border border-[#D1D8E6]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[#5B6487] truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border shrink-0 ${iconColors[color] || iconColors.teal}`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>
    </div>
  );
}
