import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Percent,
  ArrowRight,
  RefreshCw,
  Calendar
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
  Legend
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { IssueBadge } from '../components/IssueBadge';
import { fetchSummary, fetchTransactions } from '../services/api';

export function DashboardPage({ evaluationDate, refreshKey }) {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [sumRes, txRes] = await Promise.all([
          fetchSummary(evaluationDate),
          fetchTransactions({ evaluationDate })
        ]);
        setSummary(sumRes.data);
        setRecentTransactions(txRes.data.slice(0, 6));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [evaluationDate, refreshKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400 font-mono">Aggregating ledger reconciliation metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto glass-panel rounded-2xl border border-rose-500/30 text-center my-12">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Error Connecting to Backend</h3>
        <p className="text-sm text-slate-400 mt-2">{error}</p>
        <p className="text-xs text-slate-500 mt-4">Ensure backend server is running on port 4000.</p>
      </div>
    );
  }

  // Chart datasets
  const statusChartData = [
    { name: 'Fully Settled', count: summary.statusBreakdown.fullySettled, color: '#10b981' },
    { name: 'Partial', count: summary.statusBreakdown.partial, color: '#f59e0b' },
    { name: 'Pending', count: summary.statusBreakdown.pending, color: '#64748b' },
    { name: 'Over Settled', count: summary.statusBreakdown.overSettled, color: '#f43f5e' },
    { name: 'Refunded', count: summary.statusBreakdown.refunded, color: '#a855f7' },
  ];

  const issueChartData = [
    { name: 'Critical Issues', value: summary.issueBreakdown.criticalCount, color: '#f43f5e' },
    { name: 'Warnings', value: summary.issueBreakdown.warningCount, color: '#f59e0b' },
    { name: 'Clean / Reconciled', value: summary.issueBreakdown.cleanCount, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Operations Reconciliation Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time reconciliation analytics, exception triage, and audit trail.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Evaluation Date: <strong className="text-white">{evaluationDate}</strong></span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Transactions"
          value={summary.totalTransactions}
          subtitle={`${summary.eligibleTransactions} eligible for settlement`}
          icon={Receipt}
          color="blue"
        />
        <KPICard
          title="Total Settlements"
          value={summary.totalSettlementRecords}
          subtitle={`$${summary.totalSettledAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} net settled`}
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="Outstanding Balance"
          value={`$${summary.totalOutstandingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Unreconciled eligible volume"
          icon={Clock}
          color="amber"
        />
        <KPICard
          title="Settlement Rate"
          value={`${summary.settlementRate}%`}
          subtitle={`Avg ${summary.averageDaysToSettle} days to complete`}
          icon={Percent}
          color="purple"
        />
      </div>

      {/* Secondary Status Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard
          title="Fully Settled"
          value={summary.statusBreakdown.fullySettled}
          subtitle="Matched 100%"
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="Pending Settlement"
          value={summary.statusBreakdown.pending}
          subtitle="Awaiting credit/debit"
          icon={Clock}
          color="slate"
        />
        <KPICard
          title="Critical Flags"
          value={summary.issueBreakdown.criticalCount}
          subtitle="Aged >7d or over-settled"
          icon={AlertCircle}
          color="rose"
        />
        <KPICard
          title="Warnings"
          value={summary.issueBreakdown.warningCount}
          subtitle="Partial tranche balance"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Status Distribution Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Settlement Status Distribution</h3>
            <span className="text-xs font-mono text-slate-400">By Transaction Volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue & Health Composition Pie Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Issue & Risk Composition</h3>
            <span className="text-xs font-mono text-slate-400">Discrepancy Triage</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {issueChartData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions List with Quick Action */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Latest Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quick overview of recent records and reconciliation status</p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All ({summary.totalTransactions})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-6">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Settled</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Issue Flag</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTransactions.map((t) => (
                <tr key={t.transaction_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-semibold text-white">{t.transaction_id}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{t.transaction_date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{t.merchant_name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">${t.transaction_amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">${t.total_settled_amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.settlement_status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <IssueBadge severity={t.primary_issue_severity} count={t.issues?.length} />
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      to={`/transactions/${t.transaction_id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors font-medium inline-block"
                    >
                      Audit
                    </Link>
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
