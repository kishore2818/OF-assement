import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { fetchTransactionById, getTransactionSettlementsExportUrl } from '../services/api';
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
        <RefreshCw className="w-8 h-8 text-[#1EC8A5] animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 font-mono">Fetching transaction audit details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto bg-white rounded-2xl border border-red-200 text-center my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-[#E11D48] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Transaction Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">{error || `Could not find transaction with ID "${id}"`}</p>
        <Link
          to="/transactions"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1EC8A5] hover:bg-[#19B494] text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions
        </Link>
      </div>
    );
  }

  const exp = data.financialExplanation || {};

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* Navigation Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#1EC8A5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Transactions
          </Link>

          {data.settlements && data.settlements.length > 0 && (
            <a
              href={getTransactionSettlementsExportUrl(data.transaction_id)}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export Settlements CSV
            </a>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-slate-900">{data.transaction_id}</h1>
              <StatusBadge status={data.settlement_status} />
              <IssueBadge severity={data.primary_issue_severity} count={data.issues?.length} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 font-mono flex-wrap">
              <span>Account: <strong className="text-slate-800">{data.account_id}</strong></span>
              <span>•</span>
              <span>Merchant: <strong className="text-slate-800">{data.merchant_name}</strong></span>
              <span>•</span>
              <span>Date: <strong className="text-slate-800">{data.transaction_date}</strong></span>
            </p>
          </div>

          <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-4 bg-slate-50 px-4 sm:px-5 py-3 rounded-xl border border-slate-200 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Tx Amount</span>
              <p className="text-base sm:text-xl font-bold text-slate-900">${data.transaction_amount.toFixed(2)}</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-[#059669] uppercase font-semibold block">Net Settled</span>
              <p className="text-base sm:text-xl font-bold text-[#059669]">${data.total_settled_amount.toFixed(2)}</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-[#D97706] uppercase font-semibold block">Outstanding</span>
              <p className="text-base sm:text-xl font-bold text-[#D97706]">${data.outstanding_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Calculation & Explainable Matching Card */}
      <div className="p-5 bg-gradient-to-br from-[#E6FAF5]/40 via-white to-slate-50 rounded-2xl border border-[#B3F0E1] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1EC8A5]">
            <Calculator className="w-4 h-4" />
            Explainable Financial Calculation & Status Policy
          </div>
          <span className="text-[11px] font-mono text-slate-500">Integer Cents Arithmetic</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block font-sans">Transaction Order</span>
            <span className="font-bold text-slate-900 text-sm">${data.transaction_amount.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-600 block font-sans">Total DEBIT</span>
            <span className="font-bold text-emerald-600 text-sm">+${(exp.total_debit_amount || data.total_settled_amount).toFixed(2)}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-purple-200">
            <span className="text-[10px] text-purple-600 block font-sans">Total CREDIT (Refunds)</span>
            <span className="font-bold text-purple-600 text-sm">-${(exp.total_credit_amount || 0).toFixed(2)}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#1EC8A5]/30">
            <span className="text-[10px] text-[#0F1B4C] block font-sans font-medium">Net Settled Balance</span>
            <span className="font-bold text-[#1EC8A5] text-sm">${data.total_settled_amount.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200">
            <span className="text-[10px] text-amber-600 block font-sans">Unsettled Balance</span>
            <span className="font-bold text-amber-700 text-sm">${data.outstanding_amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-600 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1EC8A5] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800">Status Rule: {data.settlement_status}</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {exp.status_definition || 'Net settled amount represents cumulative sum of debits minus credits.'}
            </p>
          </div>
        </div>
      </div>

      {/* Issues & Triage Recommendations */}
      {data.issues && data.issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Detected Exceptions & Action Items
          </h3>
          <div className="space-y-3">
            {data.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 ${
                  issue.severity === 'CRITICAL'
                    ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]'
                    : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                }`}
              >
                {issue.severity === 'CRITICAL' ? (
                  <AlertCircle className="w-5 h-5 text-[#E11D48] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase font-mono tracking-wider">
                      [{issue.code}]
                    </span>
                    <span className="text-xs font-semibold">{issue.description}</span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed font-sans">
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
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transaction Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-semibold text-slate-900">{data.transaction_id}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Lifecycle ID</span>
                <span className="font-mono text-slate-700">{data.lifecycle_id || 'None (Fallback Matched)'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Account ID</span>
                <span className="font-mono text-slate-700">{data.account_id}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Merchant</span>
                <span className="font-medium text-slate-900">{data.merchant_name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction Date</span>
                <span className="font-mono text-slate-700">{data.transaction_date}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Currency</span>
                <span className="font-mono font-bold text-slate-900">{data.currency}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Original Status</span>
                <span className="font-mono font-semibold text-[#1EC8A5]">{data.status}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Last Settled Date</span>
                <span className="font-mono text-slate-700">{data.last_settlement_date || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tranches & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Settlement Tranches Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matched settlement events in <code className="text-[#1EC8A5]">settlement_history</code>
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                {data.settlements?.length || 0} Tranche(s)
              </span>
            </div>

            {(!data.settlements || data.settlements.length === 0) ? (
              <div className="py-12 text-center text-slate-400 text-xs font-sans">
                No settlement records have been associated with this transaction yet.
              </div>
            ) : (
              <>
                {/* Mobile Tranches Card List (< md) */}
                <div className="md:hidden divide-y divide-slate-100">
                  {data.settlements.map((s) => (
                    <div key={s.settlement_id} className="p-4 space-y-2.5 active:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono font-bold text-xs text-slate-900">{s.settlement_id}</div>
                          {s.run_id && <div className="text-[10px] text-slate-400 font-sans mt-0.5">{s.run_id}</div>}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.settlement_type === 'DEBIT'
                              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                              : 'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]'
                          }`}
                        >
                          {s.settlement_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Tranche Amount</div>
                          <div className={`text-xs font-bold font-mono ${s.settlement_type === 'DEBIT' ? 'text-[#059669]' : 'text-[#7C3AED]'}`}>
                            {s.settlement_type === 'DEBIT' ? '+' : '-'}${s.settlement_amount.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Running Net</div>
                          <div className="text-xs font-bold font-mono text-slate-900">
                            ${(s.running_net_settled !== undefined ? s.running_net_settled : s.settlement_amount).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                        <span>{s.settlement_date}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-sans font-semibold text-[10px]">
                          {s.match_method === 'PRIMARY_LIFECYCLE' ? 'Primary Lifecycle' : 'Fallback Composite'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider font-mono text-[11px]">
                      <tr>
                        <th className="py-3 px-5">Settlement ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-right">Running Net</th>
                        <th className="py-3 px-4">Matching Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {data.settlements.map((s) => (
                        <tr key={s.settlement_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-5 font-semibold text-slate-900">
                            <div>{s.settlement_id}</div>
                            {s.run_id && <div className="text-[10px] text-slate-400 font-sans">{s.run_id}</div>}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{s.settlement_date}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                s.settlement_type === 'DEBIT'
                                  ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                                  : 'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]'
                              }`}
                            >
                              {s.settlement_type}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
                              s.settlement_type === 'DEBIT' ? 'text-[#059669]' : 'text-[#7C3AED]'
                            }`}
                          >
                            {s.settlement_type === 'DEBIT' ? '+' : '-'}${s.settlement_amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            ${(s.running_net_settled !== undefined ? s.running_net_settled : s.settlement_amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {s.match_method === 'PRIMARY_LIFECYCLE' ? 'Primary Lifecycle' : 'Fallback Composite'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Chronological Lifecycle Timeline */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Reconciliation Lifecycle Timeline</h3>
            <div className="pt-2">
              <Timeline events={data.timeline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
