import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  AlertTriangle,
  History,
  UploadCloud
} from 'lucide-react';

export function BottomNav({ onOpenReconcile }) {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/transactions', label: 'Ledger', icon: Receipt },
    // Center Reconcile CTA button
    { to: '#reconcile', label: 'Reconcile', isAction: true },
    { to: '/exceptions', label: 'Issues', icon: AlertTriangle },
    { to: '/runs', label: 'Batches', icon: History },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D1D8E6]/60 shadow-[0_-4px_16px_rgba(15,27,76,0.06)] pb-[env(safe-area-inset-bottom,0.5rem)]"
    >
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key="action-reconcile"
                onClick={onOpenReconcile}
                aria-label="Import CSV"
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#19B494] to-[#1EC8A5] text-white p-3 shadow-lg shadow-[#1EC8A5]/30 border-4 border-white flex items-center justify-center transform active:scale-95 transition-transform">
                  <UploadCloud className="w-6 h-6 stroke-[2.4]" />
                </div>
                <span className="text-[10px] font-bold text-[#1EC8A5] mt-0.5 tracking-tight">
                  Reconcile
                </span>
              </button>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[56px] active:scale-95 ${
                  isActive
                    ? 'text-[#1EC8A5] font-bold'
                    : 'text-[#5B6487] hover:text-[#0F1B4C] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-lg transition-colors ${
                      isActive ? 'bg-[#E6FAF5]' : 'bg-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-[#1EC8A5]' : 'text-[#5B6487]'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
