import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { fetchSummary, fetchTransactions, fetchSettlements, getExportUrl } from '../services/api';
import { generateReconciliationPDF, exportSettlementsCSV } from '../utils/reportExporter';

export function ReportsPage({ evaluationDate, refreshKey }) {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [settlementCsvSuccess, setSettlementCsvSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [sumRes, txRes, setRes] = await Promise.all([
          fetchSummary(evaluationDate),
          fetchTransactions({ evaluationDate }),
          fetchSettlements().catch(() => ({ data: [] }))
        ]);
        setSummary(sumRes.data);
        setTransactions(txRes.data || []);
        setSettlements(setRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [evaluationDate, refreshKey]);

  const handleDownloadPdf = async () => {
    try {
      setGeneratingPdf(true);
      await new Promise((resolve) => setTimeout(resolve, 300)); // small yield for UI feedback
      generateReconciliationPDF({
        summary,
        transactions,
        settlements,
        evaluationDate
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to generate PDF: ${err.message}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadSettlementsCsv = () => {
    try {
      exportSettlementsCSV(settlements);
      setSettlementCsvSuccess(true);
      setTimeout(() => setSettlementCsvSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to export settlements CSV: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#1EC8A5] animate-spin" />
        <p className="text-xs sm:text-sm text-slate-500 font-mono">Compiling report datasets and audit logs...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl border border-red-200 text-center my-12 shadow-sm">
        <AlertCircle className="w-10 h-10 text-[#E11D48] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Error Loading Report Data</h3>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
      </div>
    );
  }

  const activeDateLabel = evaluationDate || summary.latestDate || 'All Available Ledger Updates';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Financial Reports & Exports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6FAF5] text-[#1EC8A5] border border-[#B3F0E1]">
              PDF & CSV
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose between full executive PDF audit documents covering all report details or raw tabular CSV datasets.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#1EC8A5] animate-pulse"></span>
          <span>Target Date: <strong className="text-slate-900">{activeDateLabel}</strong></span>
        </div>
      </div>

      {/* Live Dataset Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Ledger Transactions</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{transactions.length}</div>
          <span className="text-[10px] text-slate-500">{summary.eligibleTransactions} eligible</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Ingested Settlements</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{settlements.length}</div>
          <span className="text-[10px] text-[#059669] font-medium">Captured records</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Settled Volume</span>
          <div className="text-xl font-bold text-[#059669] mt-1">${summary.totalSettledAmount.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">{summary.settlementRate}% rate</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Outstanding Balance</span>
          <div className="text-xl font-bold text-slate-900 mt-1">${summary.totalOutstandingAmount.toFixed(2)}</div>
          <span className="text-[10px] text-amber-600">{summary.issueBreakdown.criticalCount} critical</span>
        </div>
      </div>

      {/* Choose Format: PDF vs CSV Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* FORMAT 1: Comprehensive PDF Audit Report */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#1EC8A5]/30 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-[#1EC8A5] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#1EC8A5]" />
            <span>Recommended for Audit</span>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E6FAF5] text-[#1EC8A5] flex items-center justify-center border border-[#B3F0E1]">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Comprehensive PDF Audit Report</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generates a complete, multi-page executive audit report covering all information across your ledger.
              </p>
            </div>

            {/* Inclusions Checklist */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                Full Information Included in PDF:
              </span>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Executive Financial Summary & KPI Metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Category Breakdown (Settled, Partial, Pending, Over-settled)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Full Ledger Transactions Table with IDs, Merchants & Balances</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Ingested Processor Settlement Records & Lifecycle Tranches</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>2-Tier Algorithmic Matching Verification & Compliance Proof</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1EC8A5] hover:bg-[#19B494] text-white text-xs font-bold transition-all shadow-md shadow-[#1EC8A5]/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {generatingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling PDF Document...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>PDF Downloaded Successfully!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Full PDF Report</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Format: A4 Print Ready
            </span>
          </div>
        </div>

        {/* FORMAT 2: Raw CSV Datasets */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center border border-[#A7F3D0]">
              <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Tabular CSV Data Exports</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Raw comma-separated tabular files formatted to RFC-4180 specification for spreadsheets, data warehouses, or BI ingestion.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option A: Reconciled Transactions CSV */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Reconciled Transactions CSV</h3>
                  <p className="text-[11px] text-slate-500">
                    All ledger transactions, settled balances, and issue flags ({transactions.length} rows).
                  </p>
                </div>
                <a
                  href={getExportUrl()}
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </a>
              </div>

              {/* Option B: Ingested Settlement History CSV */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Ingested Settlement History CSV</h3>
                  <p className="text-[11px] text-slate-500">
                    All raw processor settlement records and debit/credit tranches ({settlements.length} rows).
                  </p>
                </div>
                <button
                  onClick={handleDownloadSettlementsCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
                >
                  {settlementCsvSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Exported</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>RFC-4180 standard compliant CSV files with UTF-8 encoding</span>
          </div>
        </div>

      </div>

      {/* Report Content Preview Summary */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1EC8A5]" />
            <h3 className="text-sm font-bold text-slate-900">Report Inclusions & Verification Scope</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Open Fabric Engine v1.2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-[11px]">Primary Matching Protocol</span>
            <p className="text-slate-500 leading-relaxed">
              Tier 1 exact lifecycle pairing for 1:1 single settlements and 1:N partial credits.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-[11px]">Fallback Matching Protocol</span>
            <p className="text-slate-500 leading-relaxed">
              Tier 2 multi-field correlation on account ID, merchant identity, and date window.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-[11px]">Audit Precision</span>
            <p className="text-slate-500 leading-relaxed">
              Cent-level exact arithmetic preventing fractional roundoff discrepancies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
