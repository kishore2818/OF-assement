import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { fetchTransactions } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { IssueBadge } from '../components/IssueBadge';

export function DiscrepanciesPage({ evaluationDate, refreshKey }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchTransactions({ evaluationDate });
        // Only transactions with critical or warning issues
        const flagged = res.data.filter(t => t.primary_issue_severity !== 'NONE');
        setIssues(flagged);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [evaluationDate, refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Discrepancies & Exceptions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Review flagged items requiring FinOps intervention or acquirer follow-up.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] self-start sm:self-auto">
          {issues.length} Active Exceptions
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 text-[#1EC8A5] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Analyzing discrepancy flags...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-20 text-center text-[#059669] bg-white rounded-2xl border border-slate-200">
            <p className="text-base font-bold">No active discrepancies found!</p>
            <p className="text-xs text-slate-500 mt-1">All processed transactions are cleanly reconciled.</p>
          </div>
        ) : (
          issues.map((t) => (
            <div key={t.transaction_id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <span className="font-mono font-bold text-slate-900 text-sm">{t.transaction_id}</span>
                  <span className="text-xs font-medium text-slate-600">{t.merchant_name}</span>
                  <StatusBadge status={t.settlement_status} size="sm" />
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <IssueBadge severity={t.primary_issue_severity} count={t.issues?.length} />
                  <Link
                    to={`/transactions/${t.transaction_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E6FAF5] hover:bg-[#B3F0E1] text-[#1EC8A5] text-xs font-semibold transition-colors"
                  >
                    Investigate
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Exception Details */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {t.issues.map((issue, idx) => (
                  <div key={idx} className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      {issue.severity === 'CRITICAL' ? (
                        <AlertCircle className="w-4 h-4 text-[#E11D48] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                      )}
                      <span className="font-mono text-slate-900">[{issue.code}]</span>
                      <span className="text-slate-700">{issue.description}</span>
                    </div>
                    <p className="text-slate-500 pl-6 text-[11px] leading-relaxed">
                      <strong className="text-slate-700">Action:</strong> {issue.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
