import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Layers,
  BarChart3,
  ListFilter,
  History,
  FileCheck2,
  AlertTriangle,
  FileText,
  Settings,
  ShieldCheck
} from 'lucide-react';

export function Sidebar({ onOpenReconcile }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: BarChart3 },
    { name: 'Transactions', path: '/transactions', icon: ListFilter },
    { name: 'Settlement History', path: '/settlements', icon: History },
    { name: 'Reconciliation', path: '#reconcile', icon: FileCheck2, isAction: true },
    { name: 'Discrepancies', path: '/discrepancies', icon: AlertTriangle },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
        : 'text-[#94A3B8] hover:text-white hover:bg-[#1F2937]'
    }`;

  return (
    <aside className="w-64 bg-[#111827] text-white flex flex-col shrink-0 min-h-screen border-r border-[#1F2937]">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#1F2937]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-md shadow-[#2563EB]/25 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              OpenFabric
            </h1>
            <span className="text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase">
              Reconcile Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-6 space-y-1">
        <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          Main Menu
        </span>

        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.isAction) {
              return (
                <button
                  key={item.name}
                  onClick={onOpenReconcile}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#1F2937] transition-all text-left"
                >
                  <Icon className="w-4 h-4 text-[#60A5FA]" />
                  <span>{item.name}</span>
                </button>
              );
            }

            return (
              <NavLink key={item.name} to={item.path} end={item.path === '/'} className={navLinkClass}>
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-[#1F2937]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] bg-[#1F2937]/60 p-2.5 rounded-xl border border-[#374151]/50">
          <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
          <div className="truncate">
            <span className="text-white block font-semibold">SQLite Engine</span>
            <span className="text-[10px] text-[#64748B]">PRAGMA foreign_keys = ON</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
