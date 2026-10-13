import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { fetchTransactions, getExportUrl } from '../services/api';
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">
            Transactions Ledger
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Audit individual transaction lifecycles, discrepancy flags, and settled net amounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={getExportUrl()}
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-semibold text-[#111827] transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2563EB]" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID, Merchant Name, or Account..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Severity Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] font-medium">Issue:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              {severities.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[#64748B] font-medium mr-1.5 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                statusFilter === s.value
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-[#64748B] hover:text-[#111827] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin mx-auto" />
            <p className="text-xs text-[#64748B] font-mono">Filtering transactions...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-[#DC2626] space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-[#64748B] space-y-2">
            <p className="text-sm font-medium">No transactions match the selected filters.</p>
            <p className="text-xs text-[#94A3B8]">Try broadening your search or resetting filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase tracking-wider font-mono">
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
              <tbody className="divide-y divide-[#E2E8F0]">
                {transactions.map((t) => (
                  <tr
                    key={t.transaction_id}
                    onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                      {t.transaction_id}
                    </td>
                    <td className="py-4 px-4 text-[#64748B] font-mono">{t.transaction_date}</td>
                    <td className="py-4 px-4 font-medium text-[#111827]">{t.merchant_name}</td>
                    <td className="py-4 px-4 font-mono text-[#64748B]">{t.account_id}</td>
                    <td className="py-4 px-4 font-mono font-bold text-[#111827] text-right">
                      ${t.transaction_amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-mono text-[#16A34A] font-semibold text-right">
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F1F5F9] group-hover:bg-[#EFF6FF] text-[#475569] group-hover:text-[#2563EB] transition-colors font-medium">
                        Details
                        <ExternalLink className="w-3 h-3" />
                      </span>
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
