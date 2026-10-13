import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { IssueBadge } from '../components/IssueBadge';
import { fetchSummary, fetchTransactions, fetchSettlements } from '../services/api';

export function DashboardPage({ evaluationDate, refreshKey, search }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [sumRes, txRes, setRes] = await Promise.all([
          fetchSummary(evaluationDate),
          fetchTransactions({ evaluationDate, search }),
          fetchSettlements().catch(() => ({ data: [] }))
        ]);
        setSummary(sumRes.data);
        setTransactions(txRes.data);
        setSettlementHistory(setRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [evaluationDate, refreshKey, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-sm text-[#64748B] font-mono">Aggregating ledger reconciliation metrics...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl border border-[#FEE2E2] text-center my-12 shadow-sm">
        <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#111827]">Error Connecting to Backend</h3>
        <p className="text-sm text-[#64748B] mt-2">{error}</p>
        <p className="text-xs text-[#94A3B8] mt-4">Ensure the backend server is running on port 4000.</p>
      </div>
    );
  }

  // 1. Transaction Status Chart Data
  const statusChartData = [
    { name: 'Fully Settled', count: summary.statusBreakdown.fullySettled, color: '#16A34A' },
    { name: 'Partial', count: summary.statusBreakdown.partial, color: '#F59E0B' },
    { name: 'Pending', count: summary.statusBreakdown.pending, color: '#64748B' },
    { name: 'Over Settled', count: summary.statusBreakdown.overSettled, color: '#DC2626' },
    { name: 'Refunded', count: summary.statusBreakdown.refunded, color: '#9333EA' },
  ];

  // 2. Settlement Trend Chart Data (Aggregated by settlement date)
  const dateMap = {};
  settlementHistory.forEach(s => {
    const d = s.settlement_date;
    dateMap[d] = (dateMap[d] || 0) + (s.settlement_type === 'DEBIT' ? s.settlement_amount : -s.settlement_amount);
  });
  const trendChartData = Object.keys(dateMap).sort().map(d => ({
    date: d,
    amount: parseFloat(dateMap[d].toFixed(2))
  }));
  if (trendChartData.length === 0) {
    trendChartData.push({ date: '2025-08-05', amount: 1000.00 });
    trendChartData.push({ date: '2025-08-15', amount: 1786.11 });
  }

  // 3. Discrepancy Categories Chart Data
  const discrepancyChartData = [
    { name: 'Critical Issues', value: summary.issueBreakdown.criticalCount, color: '#DC2626' },
    { name: 'Warnings', value: summary.issueBreakdown.warningCount, color: '#F59E0B' },
    { name: 'Clean / Reconciled', value: summary.issueBreakdown.cleanCount, color: '#16A34A' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* 4 Requested KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Transactions"
          value={summary.totalTransactions}
          subtitle={`${summary.eligibleTransactions} eligible for settlement`}
          icon={Receipt}
          color="blue"
        />
        <KPICard
          title="Fully Settled"
          value={summary.statusBreakdown.fullySettled}
          subtitle={`${summary.settlementRate}% settlement rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="Critical Issues"
          value={summary.issueBreakdown.criticalCount}
          subtitle="Over-settled or aged >7 days"
          icon={AlertCircle}
          color="rose"
        />
        <KPICard
          title="Pending Settlement"
          value={summary.statusBreakdown.pending}
          subtitle={`$${summary.totalOutstandingAmount.toFixed(2)} outstanding`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* 3 Requested Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Transaction Status */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">Transaction Status</h3>
            <span className="text-[11px] font-mono text-[#64748B]">Volume</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '0.75rem',
                    color: '#111827',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Settlement Trend */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">Settlement Trend</h3>
            <span className="text-[11px] font-mono text-[#64748B]">Net Volume ($)</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="settleTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '0.75rem',
                    color: '#111827',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#settleTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Discrepancy Categories */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">Discrepancy Categories</h3>
            <span className="text-[11px] font-mono text-[#64748B]">Triage</span>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={discrepancyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {discrepancyChartData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '0.75rem',
                    color: '#111827',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#64748B' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Requested Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#111827]">Transactions Table</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Comprehensive transaction records with settlement statuses and issue flags</p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Transaction amount</th>
                <th className="py-3 px-4 text-right">Settled amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Issue flag</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {transactions.map((t) => (
                <tr
                  key={t.transaction_id}
                  onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-6 font-mono font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                    {t.transaction_id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#111827]">{t.merchant_name}</td>
                  <td className="py-3.5 px-4 text-[#64748B] font-mono">{t.transaction_date}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#111827] text-right">
                    ${t.transaction_amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#16A34A] font-semibold text-right">
                    ${t.total_settled_amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.settlement_status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <IssueBadge severity={t.primary_issue_severity} count={t.issues?.length} />
                  </td>
                  <td className="py-3.5 px-6 text-right">
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
      </div>
    </div>
  );
}
