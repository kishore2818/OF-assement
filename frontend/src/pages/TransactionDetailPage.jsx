import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building,
  Hash,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Clock,
  RefreshCw,
  HelpCircle,
  DollarSign
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400 font-mono">Fetching transaction audit details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto glass-panel rounded-2xl border border-rose-500/30 text-center my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Transaction Not Found</h3>
        <p className="text-sm text-slate-400 mt-2">{error || `Could not find transaction with ID "${id}"`}</p>
        <Link
          to="/transactions"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ledger
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Navigation & Title Header */}
      <div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions Ledger
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-bold text-white">{data.transaction_id}</h1>
              <StatusBadge status={data.settlement_status} />
              <IssueBadge severity={data.primary_issue_severity} count={data.issues?.length} />
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono">
              <span>Account: <strong>{data.account_id}</strong></span>
              <span>•</span>
              <span>Merchant: <strong>{data.merchant_name}</strong></span>
              <span>•</span>
              <span>Date: <strong>{data.transaction_date}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 px-5 py-3 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Transaction Amount</span>
              <p className="text-xl font-bold text-white">${data.transaction_amount.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Net Settled</span>
              <p className="text-xl font-bold text-emerald-400">${data.total_settled_amount.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Outstanding</span>
              <p className="text-xl font-bold text-amber-400">${data.outstanding_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues & Triage Recommendations (if any) */}
      {data.issues && data.issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Detected Exceptions & Action Items
          </h3>
          <div className="space-y-3">
            {data.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                  issue.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                {issue.severity === 'CRITICAL' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
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

      {/* Detailed Grid: Transaction Metadata + Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Transaction Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono font-semibold text-white">{data.transaction_id}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Lifecycle ID</span>
                <span className="font-mono text-slate-300">{data.lifecycle_id || 'None (Fallback Matched)'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Account ID</span>
                <span className="font-mono text-slate-300">{data.account_id}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Merchant</span>
                <span className="font-medium text-slate-200">{data.merchant_name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Transaction Date</span>
                <span className="font-mono text-slate-300">{data.transaction_date}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Currency</span>
                <span className="font-mono font-bold text-white">{data.currency}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Original Status</span>
                <span className="font-mono font-semibold text-sky-400">{data.status}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Last Settled Date</span>
                <span className="font-mono text-slate-300">{data.last_settlement_date || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settlement History Table & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settlement Ledger Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Settlement Tranches Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Matched settlement events in <code className="text-emerald-400">settlement_history</code>
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                {data.settlements?.length || 0} Tranche(s)
              </span>
            </div>

            {(!data.settlements || data.settlements.length === 0) ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No settlement records have been associated with this transaction yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="py-3 px-5">Settlement ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Currency</th>
                      <th className="py-3 px-5 text-right">Recorded At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {data.settlements.map((s) => (
                      <tr key={s.settlement_id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-5 font-semibold text-white">{s.settlement_id}</td>
                        <td className="py-3 px-4 text-slate-300">{s.settlement_date}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              s.settlement_type === 'DEBIT'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {s.settlement_type}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            s.settlement_type === 'DEBIT' ? 'text-emerald-400' : 'text-purple-400'
                          }`}
                        >
                          {s.settlement_type === 'DEBIT' ? '+' : '-'}${s.settlement_amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{s.currency}</td>
                        <td className="py-3 px-5 text-right text-slate-500 text-[11px] font-sans">
                          {s.processed_at ? new Date(s.processed_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Interactive Settlement Timeline Visualization (Bonus Requirement) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Reconciliation Lifecycle Timeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Sequential audit events from origination to reconciliation</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Bonus Feature
              </span>
            </div>

            <div className="pt-2">
              <Timeline events={data.timeline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
