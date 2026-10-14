import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchSettlements } from '../services/api';
import { formatDateTime } from '../utils/date';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Settlement History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Audit log of all processed payment processor debits and credit adjustments.</p>
        </div>
        <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 self-start sm:self-auto">
          {settlements.length} Records
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#1EC8A5] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Loading settlement ledger...</p>
          </div>
        ) : settlements.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <p className="text-sm">No settlement records found. Click "Reconcile New Data" to ingest a CSV.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Settlement ID</th>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Lifecycle ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-6">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.settlement_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{s.settlement_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1EC8A5]">{s.transaction_id || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{s.lifecycle_id || 'Fallback'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.settlement_date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        s.settlement_type === 'DEBIT'
                          ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                          : 'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]'
                      }`}>
                        {s.settlement_type}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${
                      s.settlement_type === 'DEBIT' ? 'text-[#059669]' : 'text-[#7C3AED]'
                    }`}>
                      {s.settlement_type === 'DEBIT' ? '+' : '-'}${s.settlement_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 text-[11px] font-sans">
                      {formatDateTime(s.processed_at)}
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
