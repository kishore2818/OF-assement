import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  fetchExceptions,
  fetchExceptionById,
  updateExceptionReview,
  getExceptionsExportUrl
} from '../services/api';

export function ExceptionsPage({ evaluationDate, refreshKey }) {
  const [exceptions, setExceptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected exception for investigation modal
  const [selectedExceptionId, setSelectedExceptionId] = useState(null);
  const [exceptionDetail, setExceptionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Review editing state
  const [editStatus, setEditStatus] = useState('UNREVIEWED');
  const [editNotes, setEditNotes] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadExceptions();
  }, [evaluationDate, refreshKey, severityFilter, reviewStatusFilter, search]);

  async function loadExceptions() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchExceptions({
        severity: severityFilter,
        reviewStatus: reviewStatusFilter,
        search,
        evaluationDate
      });
      setExceptions(res.exceptions || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openInvestigation(exceptionId) {
    setSelectedExceptionId(exceptionId);
    setSaveSuccess(false);
    try {
      setDetailLoading(true);
      const res = await fetchExceptionById(exceptionId);
      setExceptionDetail(res.data);
      setEditStatus(res.data.review.review_status);
      setEditNotes(res.data.review.notes || '');
    } catch (err) {
      console.error('Failed to load exception detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSaveReview(e) {
    e.preventDefault();
    if (!selectedExceptionId) return;

    try {
      setSavingReview(true);
      await updateExceptionReview(selectedExceptionId, {
        reviewStatus: editStatus,
        notes: editNotes,
        reviewedBy: 'Operations Analyst'
      });
      setSaveSuccess(true);
      loadExceptions();
      // Update local detail state
      if (exceptionDetail) {
        setExceptionDetail({
          ...exceptionDetail,
          review: {
            ...exceptionDetail.review,
            review_status: editStatus,
            notes: editNotes
          }
        });
      }
    } catch (err) {
      alert(`Failed to save review: ${err.message}`);
    } finally {
      setSavingReview(false);
    }
  }

  // Summary counts
  const criticalCount = exceptions.filter((e) => e.severity === 'CRITICAL').length;
  const warningCount = exceptions.filter((e) => e.severity === 'WARNING').length;
  const unreviewedCount = exceptions.filter((e) => e.review_status === 'UNREVIEWED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Exception Management Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {total} Total Issues
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Investigate discrepancies, review explainable matching formulas, add investigation notes, and manage operational resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getExceptionsExportUrl({ severity: severityFilter, reviewStatus: reviewStatusFilter, search })}
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
          <button
            onClick={loadExceptions}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Triage Overview Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-rose-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Critical Severity</span>
            <div className="text-2xl font-extrabold font-mono text-rose-700">{criticalCount}</div>
            <p className="text-[11px] text-slate-500">Over-settled or missing &gt;7 days</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Warning Severity</span>
            <div className="text-2xl font-extrabold font-mono text-amber-700">{warningCount}</div>
            <p className="text-[11px] text-slate-500">Partial settlements or batch warnings</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Awaiting Review</span>
            <div className="text-2xl font-extrabold font-mono text-slate-800">{unreviewedCount}</div>
            <p className="text-[11px] text-slate-500">Unresolved operational discrepancies</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Merchant, Tx ID, or Exception ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#1EC8A5]/20 focus:border-[#1EC8A5] bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#1EC8A5]/20"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warnings Only</option>
            </select>
          </div>

          {/* Review Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">Status:</span>
            <select
              value={reviewStatusFilter}
              onChange={(e) => setReviewStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#1EC8A5]/20"
            >
              <option value="ALL">All Reviews</option>
              <option value="UNREVIEWED">Unreviewed</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#1EC8A5] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Aggregating active ledger exceptions...</p>
          </div>
        ) : exceptions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Discrepancies Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All transactions matching active filter criteria are reconciled or clean.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Exceptions Card View (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {exceptions.map((e) => (
                <div key={e.exception_id} className="p-4 space-y-3 active:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {e.transaction_id ? (
                        <Link
                          to={`/transactions/${e.transaction_id}`}
                          className="font-mono font-bold text-sm text-[#1EC8A5] hover:underline"
                        >
                          {e.transaction_id}
                        </Link>
                      ) : (
                        <span className="text-slate-400 font-sans italic text-xs">Unlinked Batch Record</span>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                        {e.exception_id}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        e.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {e.severity === 'CRITICAL' ? (
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      )}
                      {e.severity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{e.merchant_name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Detected: {e.detection_date}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700">
                    <div className="font-semibold text-slate-500 text-[10px] uppercase">Rule Flagged</div>
                    <div>{e.issue_type}</div>
                  </div>

                  {/* Amounts 3-way Breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Expected</div>
                      <div className="text-xs font-bold font-mono text-slate-900">${e.expected_amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Settled</div>
                      <div className="text-xs font-bold font-mono text-slate-700">${e.net_settled_amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-500 uppercase font-semibold">Difference</div>
                      <div className="text-xs font-bold font-mono text-rose-600">${e.difference_amount.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Review Status and Action */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        e.review_status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : e.review_status === 'UNDER_REVIEW'
                          ? 'bg-[#E6FAF5] text-[#1EC8A5] border border-[#B3F0E1]'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {e.review_status === 'RESOLVED' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : e.review_status === 'UNDER_REVIEW' ? (
                        <Clock className="w-3 h-3 text-brand-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      )}
                      {e.review_status.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => openInvestigation(e.exception_id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1EC8A5] hover:bg-[#19B494] active:scale-95 rounded-xl transition-all shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Investigate
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Exception & Tx ID</th>
                    <th className="px-4 py-3">Merchant</th>
                    <th className="px-4 py-3">Issue Type & Severity</th>
                    <th className="px-4 py-3 text-right">Expected</th>
                    <th className="px-4 py-3 text-right">Net Settled</th>
                    <th className="px-4 py-3 text-right text-rose-600">Difference</th>
                    <th className="px-4 py-3">Review Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {exceptions.map((e) => (
                    <tr key={e.exception_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        {e.transaction_id ? (
                          <Link
                            to={`/transactions/${e.transaction_id}`}
                            className="font-bold text-[#1EC8A5] hover:underline"
                          >
                            {e.transaction_id}
                          </Link>
                        ) : (
                          <span className="text-slate-400 font-sans italic">Unlinked Batch Record</span>
                        )}
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{e.exception_id}</div>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="font-semibold text-slate-800">{e.merchant_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Detected: {e.detection_date}</div>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              e.severity === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {e.severity === 'CRITICAL' ? (
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                            )}
                            {e.severity}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">
                          {e.issue_type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">${e.expected_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">${e.net_settled_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">${e.difference_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            e.review_status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : e.review_status === 'UNDER_REVIEW'
                              ? 'bg-[#E6FAF5] text-[#1EC8A5] border border-[#B3F0E1]'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {e.review_status === 'RESOLVED' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : e.review_status === 'UNDER_REVIEW' ? (
                            <Clock className="w-3 h-3 text-brand-400" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          )}
                          {e.review_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-sans">
                        <button
                          onClick={() => openInvestigation(e.exception_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1EC8A5] hover:bg-[#19B494] rounded-xl transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Investigation & Review Modal / Bottom Sheet */}
      {selectedExceptionId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 sm:zoom-in-95">
            {/* Mobile Sheet Drag Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-50 border-b border-slate-100">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Exception Investigation Desk
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedExceptionId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExceptionId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  Loading exception investigation dossier...
                </div>
              ) : !exceptionDetail ? (
                <div className="text-center py-6 text-xs text-red-500">Failed to load exception details.</div>
              ) : (
                <>
                  {/* Diagnosis & Rule Explanations */}
                  <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        RULE: {exceptionDetail.exception.issue_type}
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        Severity: {exceptionDetail.exception.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {exceptionDetail.exception.description}
                    </p>
                    <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-start gap-2 text-xs text-rose-900 font-sans">
                      <span className="font-bold text-[11px] shrink-0">RECOMMENDED ACTION:</span>
                      <span>{exceptionDetail.exception.recommendation}</span>
                    </div>
                  </div>

                  {/* Explainable Financial Formula & Calculation */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
                        Financial Reconciliation Formula
                      </span>
                      <span className="text-[10px] text-slate-400">Integer Cents Precision</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-[#1EC8A5] font-bold">
                      {exceptionDetail.explanation.financialFormula}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-sans">Expected Txn</span>
                        <span className="font-bold text-slate-900">
                          ${exceptionDetail.exception.expected_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-sans">Net Settled</span>
                        <span className="font-bold text-emerald-600">
                          ${exceptionDetail.exception.net_settled_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-rose-200 bg-rose-50/30">
                        <span className="text-[10px] text-rose-600 block font-sans">Difference</span>
                        <span className="font-bold text-rose-600">
                          ${exceptionDetail.exception.difference_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details (if linked) */}
                  {exceptionDetail.transaction && (
                    <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Linked Transaction: {exceptionDetail.transaction.transaction_id}
                        </span>
                        <Link
                          to={`/transactions/${exceptionDetail.transaction.transaction_id}`}
                          className="text-xs font-semibold text-[#1EC8A5] hover:underline flex items-center gap-1"
                        >
                          View Full Transaction <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1 text-slate-600">
                        <div>Merchant: <b className="text-slate-900 font-sans">{exceptionDetail.transaction.merchant_name}</b></div>
                        <div>Date: <b className="text-slate-900">{exceptionDetail.transaction.transaction_date}</b></div>
                        <div>Account: <b className="text-slate-900">{exceptionDetail.transaction.account_id}</b></div>
                        <div>Status: <b className="text-slate-900">{exceptionDetail.transaction.settlement_status}</b></div>
                      </div>
                    </div>
                  )}

                  {/* Operational Review Workflow Form */}
                  <form onSubmit={handleSaveReview} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
                        <MessageSquare className="w-3.5 h-3.5 text-[#1EC8A5]" />
                        Operational Review & Investigation Notes
                      </h4>
                      {saveSuccess && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Saved to SQLite
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 font-sans">
                        Review Resolution State:
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#1EC8A5]/20"
                      >
                        <option value="UNREVIEWED">UNREVIEWED (Requires triage)</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW (Investigation in progress)</option>
                        <option value="RESOLVED">RESOLVED (Exception reconciled or approved)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 font-sans">
                        Investigation Notes / Root Cause Analysis:
                      </label>
                      <textarea
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add notes explaining investigation findings, processor dispute references, or banking correspondence..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1EC8A5]/20 font-sans text-slate-800"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={savingReview}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#1EC8A5] hover:bg-[#19B494] rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {savingReview ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Save Review State
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedExceptionId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
