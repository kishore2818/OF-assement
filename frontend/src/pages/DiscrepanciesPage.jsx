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
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827]">Discrepancies & Exceptions</h1>
          <p className="text-sm text-[#64748B] mt-1">Review flagged items requiring FinOps intervention or acquirer follow-up.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626]">
          {issues.length} Active Exceptions
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E2E8F0]">
            <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] font-mono">Analyzing discrepancy flags...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="py-20 text-center text-[#16A34A] bg-white rounded-2xl border border-[#E2E8F0]">
            <p className="text-base font-bold">No active discrepancies found!</p>
            <p className="text-xs text-[#64748B] mt-1">All processed transactions are cleanly reconciled.</p>
          </div>
        ) : (
          issues.map((t) => (
            <div key={t.transaction_id} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#111827] text-sm">{t.transaction_id}</span>
                  <span className="text-xs font-medium text-[#475569]">{t.merchant_name}</span>
                  <StatusBadge status={t.settlement_status} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <IssueBadge severity={t.primary_issue_severity} count={t.issues?.length} />
                  <Link
                    to={`/transactions/${t.transaction_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-semibold transition-colors"
                  >
                    Investigate
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Exception Details */}
              <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
                {t.issues.map((issue, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                      {issue.severity === 'CRITICAL' ? (
                        <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                      )}
                      <span className="font-mono text-[#111827]">[{issue.code}]</span>
                      <span className="text-[#334155]">{issue.description}</span>
                    </div>
                    <p className="text-[#64748B] pl-6 text-[11px]">
                      <strong>Action:</strong> {issue.recommendation}
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
