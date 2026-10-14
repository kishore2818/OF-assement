import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BarChart3,
  ListFilter,
  History,
  FileCheck2,
  AlertTriangle,
  FileText,
  Settings,
  X
} from 'lucide-react';

export function Sidebar({ isOpen, onClose, onOpenReconcile }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Transactions', path: '/transactions', icon: ListFilter },
    { name: 'Settlement History', path: '/settlements', icon: History },
    { name: 'Reconciliation', path: '#reconcile', icon: FileCheck2, isAction: true },
    { name: 'Exceptions', path: '/exceptions', icon: AlertTriangle },
    { name: 'Upload History', path: '/runs', icon: History },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleItemClick = (item) => {
    if (item.isAction) {
      onOpenReconcile();
    }
    if (onClose) {
      onClose();
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
      isActive
        ? 'bg-[#1EC8A5]/15 text-[#7FE3C4] shadow-sm shadow-[#1EC8A5]/10 border border-[#1EC8A5]/20'
        : 'text-[#9EA5C7] hover:text-white hover:bg-white/[0.06] border border-transparent'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay (for small screens only) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#0F1B4C]/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* OpenFabric Deep Navy Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-64 sidebar-brand text-white flex flex-col shrink-0 border-r border-white/[0.06] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-30 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Official Open Fabric Logo */}
        <div className="p-5 sm:p-6 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <Link
            to="/"
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-[#1EC8A5]/15 group-hover:shadow-[#1EC8A5]/30 group-hover:scale-105 transition-all shrink-0">
              <img src="/favicon.png" alt="Open Fabric" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                  Open Fabric
                </h1>
                <span className="status-dot-live"></span>
              </div>
              <span className="text-[10px] font-semibold text-[#5B6487] tracking-wider uppercase font-mono">
                Reconcile Hub
              </span>
            </div>
          </Link>

          {/* Close Button on Mobile Drawer */}
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 rounded-xl text-[#9EA5C7] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List (Scrollable internally if items exceed screen height) */}
        <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <span className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5B6487]">
            Navigation
          </span>

          <nav className="mt-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.isAction) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-[#9EA5C7] hover:text-white hover:bg-white/[0.06] transition-all text-left group border border-transparent"
                  >
                    <Icon className="w-4 h-4 text-[#27A8E0] group-hover:text-[#7FE3C4] transition-colors" />
                    <span>{item.name}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => onClose && onClose()}
                  className={navLinkClass}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System Status / Engine Footnote */}
        <div className="p-4 border-t border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#9EA5C7] bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06]">
            <div className="status-dot-live shrink-0"></div>
            <div className="truncate">
              <span className="text-white block font-semibold text-[11px]">SQLite Ledger Node</span>
              <span className="text-[10px] text-[#5B6487]">Card-rail engine v1.2</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
