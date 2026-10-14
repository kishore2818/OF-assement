import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { fetchTransactions, getFilteredTransactionsExportUrl } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { IssueBadge } from '../components/IssueBadge';

export function TransactionsPage({ evaluationDate, refreshKey }) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchTransactions({
          status: statusFilter,
          severity: severityFilter,
          search: search,
          evaluationDate: evaluationDate
        });
        setTransactions(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, statusFilter, severityFilter, evaluationDate, refreshKey]);

  const statuses = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Fully Settled', value: 'FULLY_SETTLED' },
    { label: 'Partial', value: 'PARTIAL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Over Settled', value: 'OVER_SETTLED' },
    { label: 'Refunded', value: 'REFUNDED' },
  ];

  const severities = [
    { label: 'All Severities', value: 'ALL' },
    { label: '🔴 Critical Issues', value: 'CRITICAL' },
    { label: '🟡 Warnings', value: 'WARNING' },
    { label: '🟢 Clear', value: 'NONE' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Transactions Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit individual transaction lifecycles, discrepancy flags, and settled net amounts.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <a
            href={getFilteredTransactionsExportUrl({ status: statusFilter, severity: severityFilter, search, evaluationDate })}
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1EC8A5]" />
            Export Filtered CSV
          </a>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID, Merchant Name, or Account..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/10"
            />
          </div>

          {/* Severity Filter Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-500 font-medium shrink-0">Issue:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#1EC8A5] cursor-pointer"
            >
              {severities.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-slate-500 font-medium mr-1.5 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                statusFilter === s.value
                  ? 'bg-[#1EC8A5] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#1EC8A5] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Filtering transactions...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-[#E11D48] space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <p className="text-sm font-medium">No transactions match the selected filters.</p>
            <p className="text-xs text-slate-400">Try broadening your search or resetting filters.</p>
          </div>
        ) : (
          <>
            {/* Mobile Adaptive Cards View (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.map((t) => {
                const percent = t.transaction_amount > 0 ? Math.min(100, Math.round((t.total_settled_amount / t.transaction_amount) * 100)) : 0;
                return (
                  <div
                    key={t.transaction_id}
                    onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                    className="p-4 space-y-3 active:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-sm text-[#1EC8A5] flex items-center gap-1.5">
                          {t.transaction_id}
                        </div>
                        <div className="text-xs font-semibold text-slate-800 mt-0.5">
                          {t.merchant_name}
                        </div>
                      </div>
                      <StatusBadge status={t.settlement_status} size="sm" />
                    </div>

                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Booked</div>
                        <div className="text-xs font-bold font-mono text-slate-900">${t.transaction_amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Settled</div>
                        <div className="text-xs font-bold font-mono text-emerald-600">${t.total_settled_amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Outstanding</div>
                        <div className="text-xs font-bold font-mono text-amber-600">${t.outstanding_amount.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Settlement Progress</span>
                        <span className="font-mono font-semibold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            t.settlement_status === 'OVER_SETTLED'
                              ? 'bg-purple-500'
                              : percent === 100
                              ? 'bg-emerald-500'
                              : percent > 0
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{t.transaction_date}</span>
                        {t.issues?.length > 0 && (
                          <IssueBadge severity={t.primary_issue_severity} count={t.issues?.length} />
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[#1EC8A5] font-semibold">
                        Details <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6">Transaction ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Merchant</th>
                    <th className="py-3.5 px-4">Account</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-right">Net Settled</th>
                    <th className="py-3.5 px-4 text-right">Outstanding</th>
                    <th className="py-3.5 px-4">Settlement Status</th>
                    <th className="py-3.5 px-4">Issue Flag</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr
                      key={t.transaction_id}
                      onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-mono font-semibold text-slate-900 group-hover:text-[#1EC8A5] transition-colors">
                        {t.transaction_id}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{t.transaction_date}</td>
                      <td className="py-4 px-4 font-medium text-slate-900">{t.merchant_name}</td>
                      <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">{t.account_id}</td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-right">
                        ${t.transaction_amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono text-[#059669] font-semibold text-right">
                        ${t.total_settled_amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono text-[#D97706] font-medium text-right">
                        ${t.outstanding_amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={t.settlement_status} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <IssueBadge severity={t.primary_issue_severity} count={t.issues?.length} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-[#E6FAF5] text-slate-600 group-hover:text-[#1EC8A5] transition-colors font-medium">
                          Details
                          <ExternalLink className="w-3 h-3" />
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
    </div>
  );
}
