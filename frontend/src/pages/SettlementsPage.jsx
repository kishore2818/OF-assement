import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Download } from 'lucide-react';
import { fetchSettlements } from '../services/api';

export function SettlementsPage({ refreshKey }) {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchSettlements();
        setSettlements(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827]">Settlement History</h1>
          <p className="text-sm text-[#64748B] mt-1">Audit log of all processed payment processor debits and credit adjustments.</p>
        </div>
        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827]">
          {settlements.length} Records
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] font-mono">Loading settlement ledger...</p>
          </div>
        ) : settlements.length === 0 ? (
          <div className="py-20 text-center text-[#64748B]">
            <p className="text-sm">No settlement records found. Click "Reconcile New Data" to ingest a CSV.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Settlement ID</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Lifecycle ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-6">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {settlements.map((s) => (
                  <tr key={s.settlement_id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-6 font-semibold text-[#111827]">{s.settlement_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#2563EB]">{s.transaction_id || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{s.lifecycle_id || 'Fallback'}</td>
                    <td className="py-3.5 px-4 text-[#475569]">{s.settlement_date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        s.settlement_type === 'DEBIT'
                          ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                          : 'bg-[#FAF5FF] text-[#9333EA] border border-[#F3E8FF]'
                      }`}>
                        {s.settlement_type}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      s.settlement_type === 'DEBIT' ? 'text-[#16A34A]' : 'text-[#9333EA]'
                    }`}>
                      {s.settlement_type === 'DEBIT' ? '+' : '-'}${s.settlement_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6 text-[#94A3B8] text-[11px] font-sans">
                      {s.processed_at ? new Date(s.processed_at).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
