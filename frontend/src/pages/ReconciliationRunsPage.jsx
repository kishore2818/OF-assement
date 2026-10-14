import React, { useState, useEffect } from 'react';
import {
  History,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Eye,
  RefreshCw,
  Search,
  Clock,
  ArrowRight,
  Database,
  Layers,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { fetchReconciliationRuns, fetchReconciliationRunById, getRejectedItemsExportUrl, deleteReconciliationRun } from '../services/api';
import { formatDateTime, formatTimeAgo } from '../utils/date';

export function ReconciliationRunsPage({ refreshKey }) {
  const [runs, setRuns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedRun, setSelectedRun] = useState(null);
  const [runDetails, setRunDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadRuns();
  }, [refreshKey]);

  async function handleDeleteRun(runId, fileName) {
    if (!window.confirm(`Are you sure you want to delete file "${fileName}" (${runId})?\n\nThis will remove all settlements ingested from this file and roll back the affected transactions to their previous state.`)) {
      return;
    }
    try {
      setDeletingId(runId);
      await deleteReconciliationRun(runId);
      if (selectedRun && selectedRun.run_id === runId) {
        setSelectedRun(null);
        setRunDetails(null);
      }
      await loadRuns();
    } catch (err) {
      alert(`Failed to delete run: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function loadRuns() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchReconciliationRuns({ limit: 100 });
      setRuns(res.runs || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openRunDetails(run) {
    setSelectedRun(run);
    try {
      setDetailsLoading(true);
      const res = await fetchReconciliationRunById(run.run_id);
      setRunDetails(res.data);
    } catch (err) {
      console.error('Failed to load run items:', err);
    } finally {
      setDetailsLoading(false);
    }
  }

  const filteredRuns = runs.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.run_id.toLowerCase().includes(q) ||
      r.file_name.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  function getStatusBadge(status) {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Partial / Discrepancies
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Reconciliation Run History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#1EC8A5]/10 text-[#1EC8A5] border border-[#1EC8A5]/20">
              {total} Audited {total === 1 ? 'Run' : 'Runs'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete immutable audit log of all batch CSV ingestion runs, matching outcomes, and error reports.
          </p>
        </div>

        <button
          onClick={loadRuns}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Run ID or File Name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#1EC8A5]/20 focus:border-[#1EC8A5] bg-slate-50/50"
          />
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#1EC8A5] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Loading reconciliation run records...</p>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Reconciliation Runs Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Run records are automatically generated every time you upload or paste a settlement CSV for reconciliation.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Adaptive Run Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredRuns.map((r) => (
                <div key={r.run_id} className="p-4 space-y-3 active:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold text-sm text-[#1EC8A5]">{r.run_id}</div>
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{r.file_name}</span>
                      </div>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{formatDateTime(r.created_at)}</span>
                    <span>{(r.file_size_bytes / 1024).toFixed(1)} KB • {r.duration_ms}ms</span>
                  </div>

                  {/* 4-Stat Mobile Grid */}
                  <div className="grid grid-cols-4 gap-2 p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Read</div>
                      <div className="text-xs font-bold font-mono text-slate-900">{r.records_read}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-600 uppercase font-semibold">Matched</div>
                      <div className="text-xs font-bold font-mono text-emerald-700">{r.matched_records}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-brand-400 uppercase font-semibold">Inserted</div>
                      <div className="text-xs font-bold font-mono text-[#1EC8A5]">{r.new_settlements_inserted}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-600 uppercase font-semibold">Issues</div>
                      <div className="text-xs font-bold font-mono text-rose-700">{r.invalid_records + r.unmatched_records}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => openRunDetails(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1EC8A5] bg-[#1EC8A5]/10 hover:bg-[#1EC8A5]/20 active:scale-95 rounded-xl transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    <button
                      onClick={() => handleDeleteRun(r.run_id, r.file_name)}
                      disabled={deletingId === r.run_id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 active:scale-95 rounded-xl transition-all border border-rose-200"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${deletingId === r.run_id ? 'animate-spin' : ''}`} />
                      Delete
                    </button>
                    {(r.invalid_records > 0 || r.unmatched_records > 0) && (
                      <a
                        href={getRejectedItemsExportUrl(r.run_id)}
                        download
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                        title="Download rejected records CSV"
                      >
                        <Download className="w-3 h-3" />
                        CSV
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Run ID & Timestamp</th>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Read</th>
                    <th className="px-4 py-3 text-right text-emerald-700">Matched</th>
                    <th className="px-4 py-3 text-right text-[#1EC8A5]">Inserted</th>
                    <th className="px-4 py-3 text-right text-slate-600">Skipped</th>
                    <th className="px-4 py-3 text-right text-rose-700">Rejected / Unmatched</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredRuns.map((r) => (
                    <tr key={r.run_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#1EC8A5]">{r.run_id}</div>
                        <div className="text-[11px] font-semibold text-slate-800">{formatDateTime(r.created_at)}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{formatTimeAgo(r.created_at)}</div>
                      </td>
                      <td className="px-4 py-3 font-sans">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                          {r.file_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {(r.file_size_bytes / 1024).toFixed(1)} KB • {r.duration_ms}ms
                        </div>
                      </td>
                      <td className="px-4 py-3 font-sans">{getStatusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">{r.records_read}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{r.matched_records}</td>
                      <td className="px-4 py-3 text-right font-bold text-brand-400">{r.new_settlements_inserted}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{r.duplicates_skipped}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">
                        {r.invalid_records + r.unmatched_records}
                      </td>
                      <td className="px-4 py-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRunDetails(r)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1EC8A5] hover:bg-[#1EC8A5]/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>
                          <button
                            onClick={() => handleDeleteRun(r.run_id, r.file_name)}
                            disabled={deletingId === r.run_id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 hover:border-rose-300"
                            title={`Delete file ${r.file_name} and roll back settlements`}
                          >
                            <Trash2 className={`w-3.5 h-3.5 ${deletingId === r.run_id ? 'animate-spin' : ''}`} />
                            <span>Delete</span>
                          </button>
                          {(r.invalid_records > 0 || r.unmatched_records > 0) && (
                            <a
                              href={getRejectedItemsExportUrl(r.run_id)}
                              download
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                              title="Download rejected records CSV"
                            >
                              <Download className="w-3 h-3" />
                              CSV
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Run Details Modal / Bottom Sheet */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 sm:zoom-in-95">
            {/* Mobile Sheet Drag Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-slate-50 border-b border-slate-100">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1EC8A5]/10 flex items-center justify-center text-[#1EC8A5]">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Run Details: <span className="font-mono text-[#1EC8A5]">{selectedRun.run_id}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedRun.file_name} • Ingested on {formatDateTime(selectedRun.created_at)} ({formatTimeAgo(selectedRun.created_at)})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteRun(selectedRun.run_id, selectedRun.file_name)}
                  disabled={deletingId === selectedRun.run_id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 hover:border-rose-300"
                  title="Delete this run and roll back settlements"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete File</span>
                </button>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Metrics Breakdown Cards */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Read</span>
                <div className="text-xl font-bold font-mono text-slate-900">{selectedRun.records_read}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Matched & Inserted</span>
                <div className="text-xl font-bold font-mono text-emerald-600">
                  {selectedRun.new_settlements_inserted}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Duplicates Skipped</span>
                <div className="text-xl font-bold font-mono text-slate-700">
                  {selectedRun.duplicates_skipped}
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Rejected / Unmatched</span>
                <div className="text-xl font-bold font-mono text-rose-600">
                  {selectedRun.invalid_records + selectedRun.unmatched_records}
                </div>
              </div>
            </div>

            {/* Itemized Audit List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Itemized Event Log ({runDetails?.items?.length || 0} events)
                </h4>
                {(selectedRun.invalid_records > 0 || selectedRun.unmatched_records > 0) && (
                  <a
                    href={getRejectedItemsExportUrl(selectedRun.run_id)}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Rejected CSV
                  </a>
                )}
              </div>

              {detailsLoading ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  Loading itemized audit records...
                </div>
              ) : !runDetails?.items || runDetails.items.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-mono">
                  No individual item discrepancies flagged for this run.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {runDetails.items.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-slate-50/70 flex items-start justify-between gap-4 font-mono">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
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

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
