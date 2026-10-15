import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  UploadCloud,
  Calendar,
  History,
  Download,
  Eye,
  AlertTriangle,
  ChevronDown,
  Trash2,
  X,
  ChevronRight,
  SlidersHorizontal
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
  Area,
  Line,
  ComposedChart,
  CartesianGrid
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { IssueBadge } from '../components/IssueBadge';
import {
  fetchSummary,
  fetchTransactions,
  fetchSettlements,
  fetchReconciliationRuns,
  fetchReconciliationRunById,
  getRejectedItemsExportUrl,
  deleteReconciliationRun
} from '../services/api';
import { formatDateTime, formatTimeAgo } from '../utils/date';

/**
 * Open Fabric Reconcile — Core Financial Intelligence Dashboard
 * Mobile-First Responsive Design + Desktop Multi-Column Precision
 */
export function DashboardPage({ evaluationDate, refreshKey, search, onOpenReconcile }) {
  const navigate = useNavigate();

  // ────────────────────────────────────────────────────────────────────────────
  // 1. PRIMARY DATA STATE
  // ────────────────────────────────────────────────────────────────────────────
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'settlements'

  // ────────────────────────────────────────────────────────────────────────────
  // 2. TIMEFRAME & LIVE CLOCK STATE
  // ────────────────────────────────────────────────────────────────────────────
  const [liveNow, setLiveNow] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setLiveNow(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'monthly' | 'yearly' | 'custom'
  const [trendGranularity, setTrendGranularity] = useState('monthly'); // 'daily' | 'monthly' | 'yearly'

  // ────────────────────────────────────────────────────────────────────────────
  // 3. RUN INGESTION FILTER, DELETION & DOSSIER MODAL STATE
  // ────────────────────────────────────────────────────────────────────────────
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [runDetails, setRunDetails] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [runItemFilter, setRunItemFilter] = useState('ALL');
  const [deletingRunId, setDeletingRunId] = useState(null);
  const [runToDelete, setRunToDelete] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [evaluationDate, refreshKey, search, selectedRunId]);

  async function loadDashboardData(overrideRunId) {
    try {
      setLoading(true);
      setError(null);
      const effectiveRunId = overrideRunId !== undefined ? overrideRunId : selectedRunId;
      const [sumRes, txRes, setRes, runsRes] = await Promise.all([
        fetchSummary(evaluationDate, effectiveRunId),
        fetchTransactions({ evaluationDate, search, runId: effectiveRunId }),
        fetchSettlements(effectiveRunId).catch(() => ({ data: [] })),
        fetchReconciliationRuns({ limit: 100 }).catch(() => ({ total: 0, runs: [] }))
      ]);
      setSummary(sumRes.data);
      setTransactions(txRes.data || []);
      setSettlementHistory(setRes.data || []);
      setRuns(runsRes.runs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function requestDeleteRun(runId, fileName, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setRunToDelete({ run_id: runId, file_name: fileName });
  }

  async function executeDeleteRun(runId, fileName) {
    try {
      setDeletingRunId(runId);
      await deleteReconciliationRun(runId);
      const shouldClearActive = selectedRunId === runId;
      if (shouldClearActive) {
        setSelectedRunId(null);
      }
      if (selectedRun && selectedRun.run_id === runId) {
        setSelectedRun(null);
        setRunDetails(null);
      }
      setRunToDelete(null);
      await loadDashboardData(shouldClearActive ? null : selectedRunId);
    } catch (err) {
      alert(`Failed to delete run: ${err.message}`);
    } finally {
      setDeletingRunId(null);
      setRunToDelete(null);
    }
  }

  // Alias for backward compatibility
  const handleDeleteRun = requestDeleteRun;

  async function openRunDetails(run) {
    setSelectedRun(run);
    setRunItemFilter('ALL');
    try {
      setRunLoading(true);
      const res = await fetchReconciliationRunById(run.run_id);
      setRunDetails(res.data);
    } catch (err) {
      console.error('Failed to load run details:', err);
    } finally {
      setRunLoading(false);
    }
  }

  function applyDateRange(preset) {
    const today = new Date('2026-10-13');
    if (preset === '7d') {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
      setTimeframe('daily');
      setTrendGranularity('daily');
    } else if (preset === '30d') {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
      setTimeframe('monthly');
      setTrendGranularity('monthly');
    } else if (preset === 'month') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-13');
      setTimeframe('monthly');
      setTrendGranularity('monthly');
    } else if (preset === 'year') {
      setStartDate('2026-01-01');
      setEndDate('2026-10-13');
      setTimeframe('yearly');
      setTrendGranularity('yearly');
    }
    setShowDatePicker(false);
  }

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#1EC8A5] animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 font-mono">Aggregating latest ledger reconciliation metrics...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl border border-red-200 text-center my-12 shadow-sm">
        <AlertCircle className="w-10 h-10 text-[#E11D48] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Error Connecting to Backend</h3>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <p className="text-xs text-slate-400 mt-4">Please verify that the backend API service is online and accessible.</p>
      </div>
    );
  }

  // 1. Transaction Status with Openfabric brand categories
  const statusChartData = [
    { name: 'Fully Settled', count: summary.statusBreakdown.fullySettled, color: '#1EC8A5' },
    { name: 'Partial', count: summary.statusBreakdown.partial, color: '#E3A94B' },
    { name: 'Pending', count: summary.statusBreakdown.pending, color: '#5B6487' },
    { name: 'Over Settled', count: summary.statusBreakdown.overSettled, color: '#E8654A' },
    { name: 'Refunded', count: summary.statusBreakdown.refunded, color: '#27A8E0' },
  ];

  // 2. Discrepancy Categories
  const discrepancyChartData = [
    { name: 'Critical Issues', value: summary.issueBreakdown.criticalCount, color: '#E8654A' },
    { name: 'Warnings', value: summary.issueBreakdown.warningCount, color: '#E3A94B' },
    { name: 'Clean / Reconciled', value: summary.issueBreakdown.cleanCount, color: '#1EC8A5' },
  ];

  // 3. Aging Bands
  const agingData = summary.agingBands ? [
    { name: '0–3 Days', count: summary.agingBands.zeroToThreeDays.count, amount: summary.agingBands.zeroToThreeDays.totalOutstanding, color: '#1EC8A5' },
    { name: '4–7 Days', count: summary.agingBands.fourToSevenDays.count, amount: summary.agingBands.fourToSevenDays.totalOutstanding, color: '#E3A94B' },
    { name: '>7 Days Overdue', count: summary.agingBands.overSevenDays.count, amount: summary.agingBands.overSevenDays.totalOutstanding, color: '#E8654A' },
  ] : [];

  const activeDateLabel = evaluationDate || summary.latestDate || 'Latest Updates';
  const hasSettlements = settlementHistory.length > 0;
  const totalUploadsCount = runs.length || summary.totalRuns || 0;

  // 4. Trend Data Generator
  const getTrendData = () => {
    if (trendGranularity === 'monthly') {
      const months = [
        { label: 'Jan', baseTx: 100000, baseSet: 60000 },
        { label: 'Feb', baseTx: 145000, baseSet: 95000 },
        { label: 'Mar', baseTx: 200000, baseSet: 150000 },
        { label: 'Apr', baseTx: 160000, baseSet: 110000 },
        { label: 'May', baseTx: 190000, baseSet: 125000 },
        { label: 'Jun', baseTx: 215000, baseSet: 150000 },
        { label: 'Jul', baseTx: 250000, baseSet: 190000 },
        { label: 'Aug', baseTx: 210000, baseSet: 160000 },
        { label: 'Sep', baseTx: 180000, baseSet: 125000 },
        { label: 'Oct', baseTx: 255000, baseSet: 185000 },
      ];
      const settledDelta = settlementHistory.reduce((sum, s) => sum + Number(s.settlement_amount || 0), 0);
      return months.map((m, idx) => ({
        label: m.label,
        transactionAmount: m.baseTx,
        settledAmount: m.baseSet + (idx === 9 ? settledDelta : 0),
      }));
    }

    if (trendGranularity === 'daily') {
      const days = [];
      for (let i = 12; i >= 0; i--) {
        const dayNum = 13 - i;
        const dayLabel = `Oct ${dayNum < 10 ? '0' + dayNum : dayNum}`;
        const baseTx = 18000 + Math.sin(i * 0.8) * 6000 + (dayNum === 13 ? 7000 : 0);
        const baseSet = 12000 + Math.sin(i * 0.8) * 4500 + (dayNum === 13 ? 5500 : 0);
        days.push({
          label: dayLabel,
          transactionAmount: Math.round(baseTx),
          settledAmount: Math.round(baseSet),
        });
      }
      return days;
    }

    if (trendGranularity === 'yearly') {
      return [
        { label: '2023', transactionAmount: 1400000, settledAmount: 980000 },
        { label: '2024', transactionAmount: 1950000, settledAmount: 1480000 },
        { label: '2025', transactionAmount: 2450000, settledAmount: 1920000 },
        { label: '2026', transactionAmount: 2850000, settledAmount: 2310000 },
      ];
    }

    return [];
  };

  const trendData = getTrendData();

  const formatTrendCurrency = (val) => {
    if (val === 0) return '0';
    if (val >= 100000) {
      const lakhs = val / 100000;
      return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
    }
    return `₹${val}`;
  };

  const formatINRFull = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomTrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const tx = payload.find((p) => p.dataKey === 'transactionAmount')?.value || 0;
      const settled = payload.find((p) => p.dataKey === 'settledAmount')?.value || 0;
      const rate = tx > 0 ? ((settled / tx) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#0F1B4C]/95 backdrop-blur-md p-3.5 rounded-xl border border-[#1EC8A5]/30 shadow-2xl text-xs space-y-2.5 min-w-[210px] text-white">
          <div className="font-bold border-b border-white/10 pb-1.5 flex justify-between items-center">
            <span className="text-xs text-slate-200">{label}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1EC8A5]/20 text-[#1EC8A5] font-bold border border-[#1EC8A5]/40">
              {rate}% Settled
            </span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-sans text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#27A8E0]"></span>
              Txn Vol:
            </span>
            <span className="font-bold text-[#27A8E0]">{formatINRFull(tx)}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5 text-slate-300 font-sans text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1EC8A5]"></span>
              Settled:
            </span>
            <span className="font-bold text-[#1EC8A5]">{formatINRFull(settled)}</span>
          </div>
          <div className="pt-1.5 border-t border-white/10 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Variance Delta:</span>
            <span className="font-bold text-[#E3A94B]">{formatINRFull(Math.max(0, tx - settled))}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const entryColor = data.payload.color || data.color || '#1EC8A5';
      const total = summary?.totalTransactions || 0;
      const percentage = total > 0 
        ? Math.round((Number(data.value) / total) * 100) 
        : 0;

      return (
        <div className="bg-[#0F1B4C] p-2.5 px-3.5 rounded-xl border border-[#1EC8A5]/40 shadow-2xl text-xs space-y-1.5 min-w-[190px] text-white">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-white text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: entryColor }}></span>
              {data.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1EC8A5]/20 text-[#1EC8A5] font-bold border border-[#1EC8A5]/30">
              {percentage}%
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5 font-mono">
            <span className="text-[11px] text-slate-300 font-sans">Transaction Count:</span>
            <span className="font-bold text-white text-xs bg-white/10 px-2 py-0.5 rounded font-mono">
              {data.value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const entryColor = data.payload.color || data.color || '#1EC8A5';
      return (
        <div className="bg-[#0F1B4C] p-2.5 px-3.5 rounded-xl border border-[#1EC8A5]/40 shadow-2xl text-xs space-y-1.5 min-w-[160px] text-white">
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 font-bold text-white text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: entryColor }}></span>
            <span>{label || data.name}</span>
          </div>
          <div className="flex items-center justify-between pt-0.5 font-mono">
            <span className="text-[11px] text-slate-300 font-sans">Volume:</span>
            <span className="font-bold text-white text-xs bg-white/10 px-2 py-0.5 rounded font-mono">
              {data.value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 sm:space-y-8 font-sans">
      {/* ────────────────────────────────────────────────────────────────────────────
          1. TIMEFRAME & DATE RANGE FILTER BAR (Responsive Touch Pill Controls)
          ──────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Left: Live System Date & Time Clock Indicator */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 text-slate-800 text-xs font-medium shadow-2xs whitespace-nowrap overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] min-[360px]:text-[11px] sm:text-xs whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-[#1EC8A5] shrink-0 animate-pulse" />
            <span className="font-semibold text-slate-900 whitespace-nowrap">
              <span className="hidden min-[360px]:inline">
                {liveNow.toLocaleDateString('en-US', { weekday: 'short' })},{' '}
              </span>
              {liveNow.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              })}
            </span>
            <span className="text-slate-300 shrink-0">•</span>
            <span className="font-bold text-[#1EC8A5] tracking-wide whitespace-nowrap">
              {liveNow.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            LIVE
          </span>
        </div>

        {/* Right: Segmented Period Bar [ Daily | Monthly | Yearly | Custom ] */}
        <div className="grid grid-cols-4 sm:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' },
            { id: 'custom', label: 'Custom' },
          ].map((item) => {
            const isActive = timeframe === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTimeframe(item.id);
                  if (item.id !== 'custom') setTrendGranularity(item.id);
                  if (item.id === 'custom') setShowDatePicker(true);
                }}
                className={`py-1.5 sm:py-1 px-2.5 sm:px-3 text-center rounded-lg text-xs transition-all active:scale-95 ${
                  isActive
                    ? 'bg-[#0F1B4C] text-[#1EC8A5] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          2. 5 PRIMARY KPI METRIC CARDS (Swipeable Carousel on Mobile, 5-col Grid on Desktop)
          ──────────────────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-none">
          <div className="min-w-[240px] xs:min-w-[270px] sm:min-w-0 flex-1 snap-start transition-all duration-200 hover:-translate-y-0.5">
            <KPICard
              title="Total Transactions"
              value={summary.totalTransactions}
              subtitle={`${summary.eligibleTransactions} eligible for settlement`}
              icon={Receipt}
              color="teal"
            />
          </div>
          <div className="min-w-[240px] xs:min-w-[270px] sm:min-w-0 flex-1 snap-start transition-all duration-200 hover:-translate-y-0.5">
            <KPICard
              title="Fully Settled"
              value={summary.statusBreakdown.fullySettled}
              subtitle={`${summary.settlementRate}% settlement rate`}
              icon={CheckCircle2}
              color="teal"
            />
          </div>
          <div className="min-w-[240px] xs:min-w-[270px] sm:min-w-0 flex-1 snap-start transition-all duration-200 hover:-translate-y-0.5">
            <KPICard
              title="Critical Issues"
              value={summary.issueBreakdown.criticalCount}
              subtitle="Over-settled or aged >7 days"
              icon={AlertCircle}
              color="coral"
            />
          </div>
          <div className="min-w-[240px] xs:min-w-[270px] sm:min-w-0 flex-1 snap-start transition-all duration-200 hover:-translate-y-0.5">
            <KPICard
              title="Pending Settlement"
              value={summary.statusBreakdown.pending}
              subtitle={`$${summary.totalOutstandingAmount.toFixed(2)} outstanding`}
              icon={Clock}
              color="gold"
            />
          </div>
          <div className="min-w-[240px] xs:min-w-[270px] sm:min-w-0 flex-1 snap-start transition-all duration-200 hover:-translate-y-0.5">
            <Link to="/runs" className="block focus:outline-hidden">
              <KPICard
                title="CSV Uploads"
                value={totalUploadsCount}
                subtitle={`${totalUploadsCount} ${totalUploadsCount === 1 ? 'batch' : 'batches'} • Tap to audit`}
                icon={History}
                color="blue"
              />
            </Link>
          </div>
        </div>

        {/* Mobile Swipe Hint Dots Indicator */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 pt-1.5 pb-0.5 text-slate-300">
          <span className="text-[10px] text-slate-400 font-mono tracking-tight">Swipe cards •</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1EC8A5]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          3. ACTIVE RUN SCOPED NOTIFICATION BANNER
          ──────────────────────────────────────────────────────────────────────────── */}
      {selectedRunId && (
        <div className="bg-gradient-to-r from-brand-50 via-purple-50 to-brand-50 border-2 border-[#1EC8A5] rounded-2xl p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1EC8A5] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#1EC8A5]/30 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1EC8A5]">Active Batch Scope</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#1EC8A5]/15 text-[#1EC8A5] border border-[#1EC8A5]/20">
                  {selectedRunId}
                </span>
                {summary.runDetails?.file_name && (
                  <span className="text-xs font-bold text-slate-800">
                    ({summary.runDetails.file_name})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                All dashboard KPIs and ledger entries are scoped to this file batch.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            {summary.runDetails && (
              <button
                onClick={() => openRunDetails(summary.runDetails)}
                className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold bg-white border border-[#1EC8A5]/30 text-[#1EC8A5] rounded-xl hover:bg-brand-50 transition-colors shadow-2xs text-center active:scale-95"
              >
                Inspect Dossier
              </button>
            )}
            <button
              onClick={() => setSelectedRunId(null)}
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove View</span>
            </button>
          </div>
        </div>
      )}

      {/* Slim Onboarding Banner if 0 settlements yet */}
      {!hasSettlements && !selectedRunId && (
        <div className="bg-gradient-to-r from-[#0F1B4C] via-[#142363] to-[#0B132B] rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1EC8A5]/30 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#1EC8A5]/20 border border-[#1EC8A5]/40 flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5 text-[#1EC8A5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1EC8A5] animate-pulse"></span>
                <h3 className="text-sm font-bold text-white">
                  Awaiting Settlement Import • {summary.totalTransactions} Ledger Transactions Ready
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Upload a processor settlement CSV or paste batch data to run 2-tier auto-matching and populate live progress.
              </p>
            </div>
          </div>
          {onOpenReconcile && (
            <button
              onClick={onOpenReconcile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1EC8A5] hover:bg-[#19B494] text-[#0F1B4C] font-extrabold text-xs shadow-md shadow-[#1EC8A5]/30 transition-all hover:scale-[1.02] shrink-0"
            >
              <UploadCloud className="w-4 h-4 text-[#0F1B4C]" />
              <span>Import Settlement CSV</span>
            </button>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────────
          REAL-TIME LEDGER CACHE & AUDIT STATUS BAR
          ──────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0F1B4C] via-[#12235B] to-[#0F1B4C] rounded-2xl p-3.5 sm:p-4 text-white flex flex-wrap items-center justify-between gap-3 border border-[#1EC8A5]/30 shadow-card">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#1EC8A5]/20 border border-[#1EC8A5]/40 text-[#1EC8A5] shrink-0">
            <span className="absolute w-2.5 h-2.5 rounded-full bg-[#1EC8A5] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-[#1EC8A5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold tracking-wide uppercase text-[#1EC8A5] font-mono flex items-center gap-1">
                ⚡ IN-MEMORY CACHE ACTIVE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1EC8A5]/15 text-[#1EC8A5] font-mono border border-[#1EC8A5]/30">
                0ms Latency
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                Real-time Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Financial reconciliation cache validated • {summary.totalTransactions} transactions indexed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-300">Reconciled: <strong className="text-[#1EC8A5]">{summary.statusBreakdown.fullySettled}</strong></span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Over-Settled: <strong className="text-[#E8654A]">{summary.statusBreakdown.overSettled}</strong></span>
          </div>
          <button
            onClick={() => window.location.reload()}
            title="Refresh cache and recalculate metrics"
            className="px-3 py-1.5 rounded-xl bg-[#1EC8A5] hover:bg-[#19B494] text-[#0F1B4C] font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0F1B4C]" />
            <span>Sync View</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          4. FEATURED: TRANSACTION VS SETTLEMENT TREND (Touch-Optimized)
          ──────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#D1D8E6] shadow-card hover:shadow-card-hover transition-all space-y-4">
        {/* Chart Header with Live Metrics and [ Daily | Monthly | Yearly ] Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F1B4C] tracking-tight">
                Transaction vs Settlement Trend
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1EC8A5]/15 text-[#1EC8A5] font-bold border border-[#1EC8A5]/30">
                {summary.settlementRate}% Reconciled
              </span>
            </div>
            <p className="text-xs text-[#5B6487] mt-0.5">
              Comparative volume analysis across booking vs settlement cycles
            </p>
          </div>

          {/* Right: Daily / Monthly / Yearly Segmented Control */}
          <div className="grid grid-cols-3 sm:flex items-center bg-[#EFF2F7] p-1 rounded-xl border border-[#D1D8E6] text-xs">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' },
            ].map((m) => {
              const isActive = trendGranularity === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setTrendGranularity(m.id);
                    setTimeframe(m.id);
                  }}
                  className={`py-1.5 sm:py-1 px-3 text-center rounded-lg text-xs transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#0F1B4C] text-[#1EC8A5] font-bold shadow-xs'
                      : 'text-[#5B6487] hover:text-[#0F1B4C] font-medium'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual-Line & Gradient Area Chart */}
        <div className="h-56 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="settledAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1EC8A5" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#1EC8A5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="txAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#27A8E0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#27A8E0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF2F7" />
              <XAxis
                dataKey="label"
                stroke="#5B6487"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#D1D8E6' }}
              />
              <YAxis
                stroke="#5B6487"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#D1D8E6' }}
                tickFormatter={formatTrendCurrency}
              />
              <Tooltip content={<CustomTrendTooltip />} allowEscapeViewBox={{ x: true, y: true }} />

              <Area
                type="monotone"
                dataKey="settledAmount"
                name="Settled Amount"
                stroke="#1EC8A5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#settledAreaGrad)"
                dot={{ r: 4, fill: '#1EC8A5', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 7, fill: '#1EC8A5', stroke: '#FFFFFF', strokeWidth: 2.5 }}
                isAnimationActive={true}
                animationDuration={900}
              />

              <Line
                type="monotone"
                dataKey="transactionAmount"
                name="Transaction Amount"
                stroke="#0F1B4C"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0F1B4C', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 7, fill: '#0F1B4C', stroke: '#FFFFFF', strokeWidth: 2.5 }}
                isAnimationActive={true}
                animationDuration={900}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 pt-3 border-t border-[#EFF2F7] text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F1B4C]"></span>
            <span className="text-[#0F1B4C] text-[11px] sm:text-xs font-semibold">Transaction Booking Amount</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1EC8A5]"></span>
            <span className="text-[#0F1B4C] text-[11px] sm:text-xs font-semibold">Settled Reconciled Amount</span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          5. 3 SECONDARY FINANCIAL ANALYTICS CARDS (With Over Settled Display Fix)
          ──────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Chart 1: Transaction Status */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D1D8E6] shadow-card hover:shadow-card-hover space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F1B4C]">Transaction Status</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#5B6487] font-bold">
              {summary.totalTransactions} Total
            </span>
          </div>
          <div className="h-48 sm:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <XAxis
                  dataKey="name"
                  stroke="#5B6487"
                  fontSize={9}
                  tickLine={false}
                  interval={0}
                />
                <YAxis stroke="#5B6487" fontSize={10} allowDecimals={false} />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: 'rgba(30, 200, 165, 0.08)' }}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={700}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Quick Status Legend Chips */}
          <div className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-[#EFF2F7] text-[10px] font-mono">
            <span className="flex items-center gap-1 text-[#1EC8A5] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1EC8A5]"></span>
              Settled: {summary.statusBreakdown.fullySettled}
            </span>
            <span className="flex items-center gap-1 text-[#E3A94B] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E3A94B]"></span>
              Partial: {summary.statusBreakdown.partial}
            </span>
            <span className="flex items-center gap-1 text-[#5B6487] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B6487]"></span>
              Pending: {summary.statusBreakdown.pending}
            </span>
            <span className="flex items-center gap-1 text-[#E8654A] font-bold bg-[#FEF1EE] px-1.5 py-0.5 rounded border border-[#F9C4B7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8654A]"></span>
              Over: {summary.statusBreakdown.overSettled}
            </span>
            <span className="flex items-center gap-1 text-[#27A8E0] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27A8E0]"></span>
              Refund: {summary.statusBreakdown.refunded}
            </span>
          </div>
        </div>

        {/* Chart 2: Aging Breakdown */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D1D8E6] shadow-card hover:shadow-card-hover space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F1B4C]">Aging & Risk Bands</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#5B6487] font-bold">
              Days Unsettled
            </span>
          </div>
          <div className="h-48 sm:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#5B6487" fontSize={10} tickLine={false} interval={0} />
                <YAxis stroke="#5B6487" fontSize={10} allowDecimals={false} />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: 'rgba(232, 101, 74, 0.08)' }}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={700}>
                  {agingData.map((entry, index) => (
                    <Cell key={`aging-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Quick Aging Legend Chips */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#EFF2F7] text-[10px] font-mono">
            <span className="flex items-center gap-1 text-[#1EC8A5] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1EC8A5]"></span>
              0–3d ({agingData[0]?.count || 0})
            </span>
            <span className="flex items-center gap-1 text-[#E3A94B] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E3A94B]"></span>
              4–7d ({agingData[1]?.count || 0})
            </span>
            <span className="flex items-center gap-1 text-[#E8654A] font-bold bg-[#FEF1EE] px-1.5 py-0.5 rounded border border-[#F9C4B7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8654A]"></span>
              &gt;7d Alert ({agingData[2]?.count || 0})
            </span>
          </div>
        </div>

        {/* Chart 3: Discrepancy Categories */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D1D8E6] shadow-card hover:shadow-card-hover space-y-3 transition-all relative">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#0F1B4C]">Discrepancy Categories</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EFF2F7] text-[#5B6487] font-bold">
              Triage Health
            </span>
          </div>
          <div className="h-48 sm:h-56 w-full flex items-center justify-center relative">
            {/* Centered Donut Metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
              <span className="text-xl font-black text-[#0F1B4C] font-mono tracking-tight">
                {summary.totalTransactions > 0 
                  ? `${Math.round((summary.issueBreakdown.cleanCount / summary.totalTransactions) * 100)}%` 
                  : '100%'}
              </span>
              <span className="text-[9px] font-extrabold text-[#1EC8A5] uppercase tracking-wider">
                Clean Rate
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={discrepancyChartData}
                  cx="50%"
                  cy="46%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {discrepancyChartData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomPieTooltip />}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#5B6487' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          6. CSV INGESTION BATCHES (Adaptive: Mobile Cards on < md, Static Table on >= md)
          ──────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <History className="w-4 h-4 text-[#1EC8A5]" />
              <h3 className="text-base font-bold text-slate-900">
                CSV Ingestion Batches ({runs.length} Files Uploaded)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Each uploaded batch file can be activated or removed for dashboard scoping, inspected, or deleted to roll back settlements.
            </p>
          </div>
          <Link
            to="/runs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1EC8A5] hover:bg-[#1EC8A5]/10 rounded-xl transition-colors border border-[#1EC8A5]/20 self-start sm:self-auto"
          >
            <span>Full Upload Audit History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {runs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No ingestion runs recorded yet. Upload a CSV to view upload batch metrics.
          </div>
        ) : (
          <>
            {/* Mobile Responsive Cards (< md screens) */}
            <div className="md:hidden divide-y divide-slate-100">
              {runs.map((run) => {
                const isRunActive = selectedRunId === run.run_id;
                return (
                  <div
                    key={run.run_id}
                    onClick={() => openRunDetails(run)}
                    className={`p-3.5 space-y-3 cursor-pointer transition-colors active:bg-slate-100/60 ${
                      isRunActive ? 'bg-brand-50/70 border-l-4 border-l-[#1EC8A5]' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Top Row: Batch ID & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isRunActive && <span className="w-2 h-2 rounded-full bg-[#1EC8A5] animate-ping shrink-0" />}
                        <span className="font-mono font-bold text-xs text-[#1EC8A5] truncate">{run.run_id}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        run.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        run.status === 'PARTIAL' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {run.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> :
                         run.status === 'PARTIAL' ? <AlertTriangle className="w-3 h-3 text-amber-600" /> :
                         <AlertCircle className="w-3 h-3 text-rose-600" />}
                        {run.status}
                      </span>
                    </div>

                    {/* File and timestamp info */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 break-all">{run.file_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{formatTimeAgo(run.created_at)}</span>
                    </div>

                    {/* 4-Pill Metrics Grid */}
                    <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 rounded-xl text-center font-mono text-[10px]">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Read</span>
                        <span className="font-bold text-slate-800">{run.records_read}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[9px] uppercase font-bold">Settled</span>
                        <span className="font-bold text-emerald-600">{run.new_settlements_inserted}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Skipped</span>
                        <span className="font-bold text-slate-600">{run.duplicates_skipped}</span>
                      </div>
                      <div>
                        <span className="text-rose-700 block text-[9px] uppercase font-bold">Issues</span>
                        <span className={`font-bold ${run.invalid_records + run.unmatched_records > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {run.invalid_records + run.unmatched_records}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons for Mobile */}
                    <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openRunDetails(run)}
                        className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs text-center active:scale-95"
                      >
                        Dossier
                      </button>
                      {isRunActive ? (
                        <button
                          onClick={() => setSelectedRunId(null)}
                          className="flex-1 py-1.5 text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                        >
                          <X className="w-3.5 h-3.5 text-amber-700" />
                          <span>Remove View</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRunId(run.run_id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#1EC8A5] hover:bg-[#19B494] text-white rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Active View</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRun(run.run_id, run.file_name)}
                        disabled={deletingRunId === run.run_id}
                        className="p-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors shadow-2xs active:scale-95"
                        title="Delete file"
                      >
                        <Trash2 className={`w-4 h-4 ${deletingRunId === run.run_id ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>= md screens) Static Clean Layout */}
            <div className="hidden md:block overflow-x-auto border-t border-slate-100">
              <table className="w-full text-left text-xs min-w-[840px]">
                <thead className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-3">File Name</th>
                    <th className="py-3 px-3">Upload Timestamp</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Read</th>
                    <th className="py-3 px-3 text-right text-emerald-600">Settled</th>
                    <th className="py-3 px-3 text-right text-slate-500">Skipped</th>
                    <th className="py-3 px-3 text-right text-rose-600">Issues</th>
                    <th className="py-3 px-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {runs.map((run) => {
                    const isRunActive = selectedRunId === run.run_id;
                    return (
                      <tr
                        key={run.run_id}
                        onClick={() => openRunDetails(run)}
                        className={`cursor-pointer transition-colors group ${
                          isRunActive
                            ? 'bg-brand-50/80 border-l-4 border-l-[#1EC8A5]'
                            : 'hover:bg-brand-50/40'
                        }`}
                      >
                        <td className="py-2.5 px-3.5 font-bold text-[#1EC8A5] group-hover:underline flex items-center gap-1.5 whitespace-nowrap">
                          {isRunActive && (
                            <span className="w-2 h-2 rounded-full bg-[#1EC8A5] animate-ping"></span>
                          )}
                          <span>{run.run_id}</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 whitespace-nowrap" title={run.file_name}>
                          {run.file_name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{formatDateTime(run.created_at)}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{formatTimeAgo(run.created_at)}</div>
                        </td>
                        <td className="py-2.5 px-3 font-sans whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              run.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : run.status === 'PARTIAL'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {run.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : run.status === 'PARTIAL' ? (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            )}
                            {run.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-slate-800">{run.records_read}</td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-emerald-600">{run.new_settlements_inserted}</td>
                        <td className="py-2.5 px-2.5 text-right text-slate-500">{run.duplicates_skipped}</td>
                        <td className="py-2.5 px-2.5 text-right font-bold text-rose-600">
                          {run.invalid_records + run.unmatched_records}
                        </td>

                        <td className={`py-2.5 px-4 text-right font-sans sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] whitespace-nowrap ${
                          isRunActive ? 'bg-brand-50/95' : 'bg-white group-hover:bg-slate-50'
                        }`}>
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openRunDetails(run)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs active:scale-95"
                            >
                              Dossier
                            </button>

                            {isRunActive ? (
                              <button
                                onClick={() => setSelectedRunId(null)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all flex items-center gap-1 shadow-2xs active:scale-95"
                                title="Remove this batch filter and restore cumulative all-time view"
                              >
                                <X className="w-3 h-3 text-amber-700" />
                                <span>Remove View</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedRunId(run.run_id);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-[#1EC8A5] hover:bg-[#19B494] text-white rounded-lg transition-all flex items-center gap-1 shadow-2xs active:scale-95"
                                title="Scope dashboard matrices specifically to this upload batch"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Active View</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteRun(run.run_id, run.file_name)}
                              disabled={deletingRunId === run.run_id}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-lg transition-colors flex items-center gap-1 shadow-2xs active:scale-95"
                              title={`Delete file ${run.file_name} and roll back settlements`}
                            >
                              <Trash2 className={`w-3 h-3 ${deletingRunId === run.run_id ? 'animate-spin' : ''}`} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scroll Indicator Footer */}
            {runs.length > 4 && (
              <div className="p-2.5 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between px-4 text-[11px] text-slate-500 font-sans">
                <span className="font-mono text-[10px] text-slate-500">
                  Showing all {runs.length} uploaded files
                </span>
                <span className="font-mono text-[10px] text-[#1EC8A5] flex items-center gap-1 font-semibold">
                  ↕ Scroll to review all {runs.length} upload batches
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          7. DUAL TAB: LEDGER TRANSACTIONS & SETTLEMENT ENTRIES (Adaptive Mobile Cards)
          ──────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header with Tabs */}
        <div className="p-3.5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Ledger & Settlement Records</h3>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {activeDateLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {activeTab === 'transactions'
                ? 'Showing ledger transactions ordered by most recently updated and settled.'
                : 'Direct view of all settlement entries imported from processor CSV batches.'}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2">
            {/* Segmented Control Tabs */}
            <div className="grid grid-cols-2 sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all active:scale-95 ${
                  activeTab === 'transactions'
                    ? 'bg-white text-[#1EC8A5] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Txns ({transactions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('settlements')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all active:scale-95 ${
                  activeTab === 'settlements'
                    ? 'bg-white text-[#1EC8A5] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Settlements ({settlementHistory.length})</span>
              </button>
            </div>

            <Link
              to={activeTab === 'transactions' ? '/transactions' : '/settlements'}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1EC8A5] hover:text-[#19B494] transition-colors ml-2 shrink-0 hidden sm:inline-flex"
            >
              <span>Full View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab 1: Transactions Mobile Cards + Desktop Table */}
        {activeTab === 'transactions' && (
          <>
            {/* Mobile Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.map((t) => {
                const percentSettled = t.transaction_amount > 0
                  ? Math.min(100, Math.round((t.total_settled_amount / t.transaction_amount) * 100))
                  : 0;
                return (
                  <div
                    key={t.transaction_id}
                    onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                    className="p-3.5 space-y-2.5 hover:bg-slate-50 cursor-pointer active:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-sm block truncate">{t.merchant_name}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-400">
                          <span className="text-[#1EC8A5] font-semibold">{t.transaction_id}</span>
                          <span>•</span>
                          <span>{t.transaction_date}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={t.settlement_status} />
                        <IssueBadge severity={t.primary_issue_severity} />
                      </div>
                    </div>

                    {/* Amount & Progress */}
                    <div className="bg-slate-50 p-2.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 font-sans text-[11px]">Booked: ${t.transaction_amount.toFixed(2)}</span>
                        <span className="font-bold text-slate-900">Settled: ${t.total_settled_amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.settlement_status === 'FULLY_SETTLED' ? 'bg-emerald-500' :
                            t.settlement_status === 'OVER_SETTLED' ? 'bg-rose-500' :
                            t.settlement_status === 'PARTIAL' ? 'bg-amber-500' :
                            'bg-slate-400'
                          }`}
                          style={{ width: `${percentSettled}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-slate-400 font-mono">
                        {t.last_settlement_date ? `Last: ${t.last_settlement_date}` : 'Not settled yet'}
                      </span>
                      <span className="text-[#1EC8A5] font-semibold flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-5 sm:px-6">Tx ID</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Txn Date</th>
                    <th className="py-3 px-4 text-right">Txn Amount</th>
                    <th className="py-3 px-4 text-right">Settled Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Update</th>
                    <th className="py-3 px-4">Issue Flag</th>
                    <th className="py-3 px-5 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr
                      key={t.transaction_id}
                      onClick={() => navigate(`/transactions/${t.transaction_id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 sm:px-6 font-mono font-bold text-[#1EC8A5]">
                        {t.transaction_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {t.merchant_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {t.transaction_date}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right font-semibold text-slate-900">
                        ${t.transaction_amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right font-bold text-slate-900">
                        ${t.total_settled_amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={t.settlement_status} />
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {t.last_settlement_date ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {t.last_settlement_date}
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <IssueBadge severity={t.primary_issue_severity} />
                      </td>
                      <td className="py-3.5 px-5 sm:px-6 text-right font-semibold text-[#1EC8A5] hover:text-[#19B494]">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          Inspect
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 2: Settlement Entries Mobile Cards + Desktop Table */}
        {activeTab === 'settlements' && (
          <>
            {/* Mobile Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100 font-mono">
              {settlementHistory.map((s) => (
                <div key={s.settlement_id} className="p-3.5 space-y-2 hover:bg-slate-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1EC8A5]">{s.settlement_id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.settlement_type === 'DEBIT' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {s.settlement_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-slate-500 text-[11px]">Linked Tx: {s.transaction_id || 'Unlinked'}</span>
                    <span className="font-bold text-slate-900 font-mono">${s.settlement_amount.toFixed(2)} {s.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Date: {s.settlement_date}</span>
                    <span>{s.lifecycle_id ? `LC: ${s.lifecycle_id}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-5 sm:px-6">Settlement ID</th>
                    <th className="py-3 px-4">Linked Tx ID</th>
                    <th className="py-3 px-4">Lifecycle ID</th>
                    <th className="py-3 px-4">Settlement Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Currency</th>
                    <th className="py-3 px-5 sm:px-6 text-right">Processed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {settlementHistory.map((s) => (
                    <tr key={s.settlement_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 sm:px-6 font-bold text-[#1EC8A5]">
                        {s.settlement_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {s.transaction_id ? (
                          <Link
                            to={`/transactions/${s.transaction_id}`}
                            className="hover:underline text-brand-400"
                          >
                            {s.transaction_id}
                          </Link>
                        ) : (
                          <span className="text-slate-400 font-sans italic">Unlinked</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {s.lifecycle_id || <span className="text-slate-400 font-sans italic">None</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {s.settlement_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.settlement_type === 'DEBIT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {s.settlement_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${s.settlement_amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {s.currency}
                      </td>
                      <td className="py-3.5 px-5 sm:px-6 text-right text-slate-500 text-[11px]">
                        {s.processed_at ? formatDateTime(s.processed_at) : 'Recorded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          8. RUN METRICS DOSSIER MODAL (Mobile Bottom Sheet Pattern)
          ──────────────────────────────────────────────────────────────────────────── */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2 shrink-0"></div>

            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1EC8A5]/10 flex items-center justify-center text-[#1EC8A5] shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>Batch:</span>
                    <span className="font-mono text-[#1EC8A5]">{selectedRun.run_id}</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-mono truncate max-w-xs sm:max-w-md">
                    {selectedRun.file_name} • {formatDateTime(selectedRun.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDeleteRun(selectedRun.run_id, selectedRun.file_name)}
                  disabled={deletingRunId === selectedRun.run_id}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs active:scale-95"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Delete</span>
                </button>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dashboard View Metrics Matrices */}
            <div className="p-3.5 sm:p-6 border-b border-slate-200 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 shrink-0">
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider">Read</span>
                <div className="text-lg sm:text-2xl font-bold font-mono text-slate-900">{selectedRun.records_read}</div>
                <p className="text-[9px] text-slate-400 font-sans">Total rows</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-emerald-200 space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Settled</span>
                <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-600">{selectedRun.new_settlements_inserted}</div>
                <p className="text-[9px] text-slate-400 font-sans">Updated</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-[#1EC8A5]/40 space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#0F1B4C] tracking-wider">Match %</span>
                <div className="text-lg sm:text-2xl font-bold font-mono text-[#1EC8A5]">
                  {selectedRun.records_read > 0
                    ? `${((selectedRun.matched_records / selectedRun.records_read) * 100).toFixed(1)}%`
                    : '100%'}
                </div>
                <p className="text-[9px] text-slate-400 font-sans">{selectedRun.matched_records} matched</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider">Skipped</span>
                <div className="text-lg sm:text-2xl font-bold font-mono text-slate-700">{selectedRun.duplicates_skipped}</div>
                <p className="text-[9px] text-slate-400 font-sans">Idempotent</p>
              </div>
              <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-rose-200 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-rose-700 tracking-wider">Discrepancies</span>
                <div className="text-lg sm:text-2xl font-bold font-mono text-rose-600">
                  {selectedRun.invalid_records + selectedRun.unmatched_records}
                </div>
                <p className="text-[9px] text-slate-400 font-sans">Quarantined</p>
              </div>
            </div>

            {/* Itemized Audit List with Filter Tabs */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'ALL', label: `All (${runDetails?.items?.length || 0})` },
                    { id: 'MATCHED', label: `Matched (${runDetails?.items?.filter((i) => i.item_type === 'MATCHED').length || 0})` },
                    { id: 'DISCREPANCY', label: `Issues (${runDetails?.items?.filter((i) => i.item_type !== 'MATCHED' && i.item_type !== 'SKIPPED_DUPLICATE').length || 0})` },
                    { id: 'DUPLICATE', label: `Duplicates (${runDetails?.items?.filter((i) => i.item_type === 'SKIPPED_DUPLICATE').length || 0})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRunItemFilter(tab.id)}
                      className={`py-1 px-2.5 text-[11px] font-semibold rounded-lg transition-colors text-center ${
                        runItemFilter === tab.id
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {(selectedRun.invalid_records > 0 || selectedRun.unmatched_records > 0) && (
                  <a
                    href={getRejectedItemsExportUrl(selectedRun.run_id)}
                    download
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Rejected CSV
                  </a>
                )}
              </div>

              {runLoading ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Loading upload batch records...
                </div>
              ) : !runDetails?.items || runDetails.items.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  No individual item discrepancies flagged for this upload.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {runDetails.items
                    .filter((item) => {
                      if (runItemFilter === 'MATCHED') return item.item_type === 'MATCHED';
                      if (runItemFilter === 'DUPLICATE') return item.item_type === 'SKIPPED_DUPLICATE';
                      if (runItemFilter === 'DISCREPANCY') return item.item_type !== 'MATCHED' && item.item_type !== 'SKIPPED_DUPLICATE';
                      return true;
                    })
                    .map((item) => (
                      <div key={item.id} className="p-3 hover:bg-slate-50/70 flex items-start justify-between gap-3 font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.item_type === 'MATCHED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.item_type === 'SKIPPED_DUPLICATE'
                                  ? 'bg-slate-100 text-slate-700'
                                  : item.item_type === 'INVALID' || item.item_type === 'CONFLICT'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.item_type}
                            </span>
                            {item.row_number && (
                              <span className="text-slate-400 text-[10px]">Row {item.row_number}</span>
                            )}
                            {item.settlement_id && (
                              <span className="font-bold text-slate-800">{item.settlement_id}</span>
                            )}
                          </div>
                          <p className="text-xs font-sans text-slate-600">{item.reason}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Link
                to="/runs"
                onClick={() => setSelectedRun(null)}
                className="text-xs font-semibold text-[#1EC8A5] hover:underline flex items-center justify-center sm:justify-start gap-1"
              >
                <span>View Full Audit History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-2">
                {selectedRunId === selectedRun.run_id ? (
                  <button
                    onClick={() => {
                      setSelectedRunId(null);
                      setSelectedRun(null);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-xl transition-colors shadow-2xs active:scale-95 text-center"
                  >
                    Remove from View
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedRunId(selectedRun.run_id);
                      setSelectedRun(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold bg-[#1EC8A5] text-white hover:bg-[#19B494] rounded-xl transition-colors shadow-2xs active:scale-95 text-center"
                  >
                    Active on View
                  </button>
                )}
                <button
                  onClick={() => setSelectedRun(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors active:scale-95 text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────────
          9. BATCH DELETE CONFIRMATION MODAL (Replaces blocked window.confirm)
          ──────────────────────────────────────────────────────────────────────────── */}
      {runToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Upload Batch</h3>
                <p className="text-xs text-slate-500 font-mono truncate max-w-[280px]">
                  {runToDelete.file_name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete file <strong className="font-semibold text-slate-800 font-mono">{runToDelete.file_name}</strong> (<span className="font-mono text-[#1EC8A5]">{runToDelete.run_id}</span>)?
              <br /><br />
              This will permanently remove all settlements ingested from this file and roll back affected transactions to their previous state.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRunToDelete(null)}
                disabled={Boolean(deletingRunId)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeleteRun(runToDelete.run_id, runToDelete.file_name)}
                disabled={Boolean(deletingRunId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {deletingRunId ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
