import React from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import { getExportUrl } from '../services/api';

export function ReportsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#111827]">Financial Reports & Export</h1>
        <p className="text-sm text-[#64748B] mt-1">Generate and download audit reports, reconciled summaries, and exception logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Reconciled Transactions Report</h3>
            <p className="text-xs text-[#64748B] mt-1">Complete RFC-4180 CSV export containing all transaction rows, settlement statuses, net settled amounts, and issue flags.</p>
          </div>
          <a
            href={getExportUrl()}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download CSV Report
          </a>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Audit Trail & Reconciliation Specs</h3>
            <p className="text-xs text-[#64748B] mt-1">Documentation and algorithmic compliance logs detailing primary lifecycle matching and fallback matching logic.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#16A34A] font-semibold bg-[#F0FDF4] px-3 py-1.5 rounded-xl border border-[#DCFCE7]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Audited Engine Compliance
          </span>
        </div>
      </div>
    </div>
  );
}
