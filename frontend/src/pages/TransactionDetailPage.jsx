import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { fetchTransactionById } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { IssueBadge } from '../components/IssueBadge';
import { Timeline } from '../components/Timeline';

export function TransactionDetailPage({ evaluationDate }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchTransactionById(id, evaluationDate);
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id, evaluationDate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-sm text-[#64748B] font-mono">Fetching transaction audit details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-white rounded-2xl border border-[#FEE2E2] text-center my-12 shadow-sm">
        <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#111827]">Transaction Not Found</h3>
        <p className="text-sm text-[#64748B] mt-2">{error || `Could not find transaction with ID "${id}"`}</p>
        <Link
          to="/transactions"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Navigation Header */}
      <div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-bold text-[#111827]">{data.transaction_id}</h1>
              <StatusBadge status={data.settlement_status} />
              <IssueBadge severity={data.primary_issue_severity} count={data.issues?.length} />
            </div>
            <p className="text-xs text-[#64748B] mt-1 flex items-center gap-2 font-mono">
              <span>Account: <strong>{data.account_id}</strong></span>
              <span>•</span>
              <span>Merchant: <strong>{data.merchant_name}</strong></span>
              <span>•</span>
              <span>Date: <strong>{data.transaction_date}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#F8FAFC] px-5 py-3 rounded-xl border border-[#E2E8F0] font-mono">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">Transaction Amount</span>
              <p className="text-xl font-bold text-[#111827]">${data.transaction_amount.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0]"></div>
            <div>
              <span className="text-[10px] text-[#16A34A] uppercase font-semibold">Net Settled</span>
              <p className="text-xl font-bold text-[#16A34A]">${data.total_settled_amount.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-[#E2E8F0]"></div>
            <div>
              <span className="text-[10px] text-[#D97706] uppercase font-semibold">Outstanding</span>
              <p className="text-xl font-bold text-[#D97706]">${data.outstanding_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues & Triage Recommendations */}
      {data.issues && data.issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Detected Exceptions & Action Items
          </h3>
          <div className="space-y-3">
            {data.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                  issue.severity === 'CRITICAL'
                    ? 'bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]'
                    : 'bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]'
                }`}
              >
                {issue.severity === 'CRITICAL' ? (
                  <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase font-mono tracking-wider">
                      [{issue.code}]
                    </span>
                    <span className="text-xs font-semibold">{issue.description}</span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">
                    <strong>Recommended Action:</strong> {issue.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata & Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Metadata */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Transaction Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Transaction ID</span>
                <span className="font-mono font-semibold text-[#111827]">{data.transaction_id}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Lifecycle ID</span>
                <span className="font-mono text-[#334155]">{data.lifecycle_id || 'None (Fallback Matched)'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Account ID</span>
                <span className="font-mono text-[#334155]">{data.account_id}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Merchant</span>
                <span className="font-medium text-[#111827]">{data.merchant_name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Transaction Date</span>
                <span className="font-mono text-[#334155]">{data.transaction_date}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Currency</span>
                <span className="font-mono font-bold text-[#111827]">{data.currency}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Original Status</span>
                <span className="font-mono font-semibold text-[#2563EB]">{data.status}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#64748B]">Last Settled Date</span>
                <span className="font-mono text-[#334155]">{data.last_settlement_date || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tranches & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Settlement Tranches Ledger</h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Matched settlement events in <code className="text-[#2563EB]">settlement_history</code>
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]">
                {data.settlements?.length || 0} Tranche(s)
              </span>
            </div>

            {(!data.settlements || data.settlements.length === 0) ? (
              <div className="py-12 text-center text-[#94A3B8] text-xs">
                No settlement records have been associated with this transaction yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-5">Settlement ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Currency</th>
                      <th className="py-3 px-5 text-right">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] font-mono">
                    {data.settlements.map((s) => (
                      <tr key={s.settlement_id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-5 font-semibold text-[#111827]">{s.settlement_id}</td>
                        <td className="py-3 px-4 text-[#475569]">{s.settlement_date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              s.settlement_type === 'DEBIT'
                                ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                                : 'bg-[#FAF5FF] text-[#9333EA] border border-[#F3E8FF]'
                            }`}
                          >
                            {s.settlement_type}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            s.settlement_type === 'DEBIT' ? 'text-[#16A34A]' : 'text-[#9333EA]'
                          }`}
                        >
                          {s.settlement_type === 'DEBIT' ? '+' : '-'}${s.settlement_amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">{s.currency}</td>
                        <td className="py-3 px-5 text-right text-[#94A3B8] text-[11px] font-sans">
                          {s.processed_at ? new Date(s.processed_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#111827]">Reconciliation Lifecycle Timeline</h3>
            <div className="pt-2">
              <Timeline events={data.timeline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
