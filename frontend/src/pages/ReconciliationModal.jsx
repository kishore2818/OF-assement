import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  Eye,
  ShieldCheck,
  RotateCcw,
  Layers
} from 'lucide-react';
import { previewReconciliation, runReconciliation, getRejectedItemsExportUrl } from '../services/api';

const DEFAULT_CSV_SAMPLE = `settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET001,LC001,ACC123,Amazon.com,2025-08-14,2025-08-15,125.99,DEBIT,USD
SET002,LC002,ACC124,Starbucks,2025-08-14,2025-08-15,4.75,DEBIT,USD
SET003,LC003,ACC125,Shell Gas,2025-08-14,2025-08-15,35.30,DEBIT,USD
SET004,LC004,ACC126,Best Buy,2025-08-14,2025-08-15,899.99,DEBIT,USD
SET005,LC004,ACC126,Best Buy,2025-08-14,2025-08-15,20.00,CREDIT,USD
SET006,LC005,ACC127,Home Depot,2025-08-14,2025-08-15,150.00,DEBIT,USD
SET007,LC005,ACC127,Home Depot,2025-08-14,2025-08-15,84.50,DEBIT,USD
SET008,LC006,ACC128,Target,2025-08-14,2025-08-15,87.25,DEBIT,USD
SET009,LC007,ACC129,Walmart,2025-08-14,2025-08-15,180.78,DEBIT,USD
SET010,LC008,ACC130,Apple,2025-08-05,2025-08-06,1299.99,DEBIT,USD
SET011,LC008,ACC130,Apple,2025-08-05,2025-08-08,299.99,CREDIT,USD
SET012,LC009,ACC131,Nike,2025-08-14,2025-08-15,189.95,DEBIT,USD
SET014,,ACC135,Corner Deli,2025-08-14,2025-08-15,32.45,DEBIT,USD
SET015,,ACC136,Shell Gas,2025-08-14,2025-08-15,28.90,DEBIT,USD
SET016,LC999,ACC199,Disney Plus,2025-08-14,2025-08-15,99.99,DEBIT,USD
SET017,,ACC137,Amazon.com,2025-08-14,2025-08-15,199.99,DEBIT,USD
SET018,,ACC777,Uber Taxi,2025-08-10,2025-08-11,25.75,DEBIT,USD
SET019,LC002,ACC124,Starbucks,2025-08-14,2025-08-15,1.50,CREDIT,USD
SET020,LC006,ACC128,Target,2025-08-14,2025-08-15,12.25,CREDIT,USD`;

export function ReconciliationModal({ isOpen, onClose, onReconciled }) {
  // Wizard Stages: 'INPUT' -> 'PREVIEW' -> 'RESULT'
  const [stage, setStage] = useState('INPUT');
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [inputMode, setInputMode] = useState('preset');

  // Preview & Processing state
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  function resetState() {
    setStage('INPUT');
    setSelectedFile(null);
    setCsvText('');
    setPreviewData(null);
    setResult(null);
    setErrorMsg(null);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  function getPayload() {
    let payload;
    let fileName = 'settlement_batch.csv';

    if (inputMode === 'file') {
      if (!selectedFile) throw new Error('Please select a CSV file first.');
      payload = selectedFile;
      fileName = selectedFile.name;
    } else if (inputMode === 'paste') {
      if (!csvText.trim()) throw new Error('Please paste CSV contents.');
      payload = csvText;
      fileName = 'pasted_settlements.csv';
    } else {
      payload = DEFAULT_CSV_SAMPLE;
      fileName = 'authoritative_sample_19_records.csv';
    }
    return { payload, fileName };
  }

  // Stage 1 -> 2: Validate & Preview
  const handleValidateAndPreview = async () => {
    try {
      setPreviewLoading(true);
      setErrorMsg(null);

      const { payload, fileName } = getPayload();
      const res = await previewReconciliation(payload, fileName);

      if (!res.success) {
        setErrorMsg(res.errors?.[0]?.error || 'Failed to preview CSV file.');
        return;
      }

      setPreviewData(res);
      setStage('PREVIEW');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Stage 2 -> 3: Confirm & Ingest
  const handleConfirmAndIngest = async () => {
    try {
      setProcessing(true);
      setErrorMsg(null);

      const { payload, fileName } = getPayload();
      const res = await runReconciliation(payload, fileName);

      setResult(res);
      setStage('RESULT');
      if (onReconciled) onReconciled();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2 shrink-0"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E6FAF5] text-[#1EC8A5] border border-[#B3F0E1]">
              <UploadCloud className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {stage === 'INPUT' && 'Ingest & Reconcile Settlement CSV'}
                  {stage === 'PREVIEW' && 'Pre-Import Validation & Schema Preview'}
                  {stage === 'RESULT' && 'Reconciliation Execution Report'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1EC8A5]/10 text-[#1EC8A5] border border-[#1EC8A5]/20 font-mono">
                  {stage === 'INPUT' && 'Step 1 of 3'}
                  {stage === 'PREVIEW' && 'Step 2 of 3'}
                  {stage === 'RESULT' && 'Step 3 of 3 (Complete)'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-sans">
                {stage === 'INPUT' && 'Select sample dataset, upload CSV file, or paste raw batch records'}
                {stage === 'PREVIEW' && 'Verify matching diagnostics, warnings, and duplicates before committing'}
                {stage === 'RESULT' && 'Audit summary of inserted settlements and updated ledger accounts'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 font-sans">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#E11D48]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ──────────────── STAGE 1: INPUT ──────────────── */}
          {stage === 'INPUT' && (
            <div className="space-y-4">
              {/* Mode Switcher */}
              <div className="flex flex-col sm:flex-row p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold gap-1">
                <button
                  onClick={() => setInputMode('preset')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    inputMode === 'preset' ? 'bg-white text-[#1EC8A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1EC8A5]" />
                  Authoritative Test Dataset (19 Rows)
                </button>
                <button
                  onClick={() => setInputMode('file')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    inputMode === 'file' ? 'bg-white text-[#1EC8A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Upload CSV File
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                    inputMode === 'paste' ? 'bg-white text-[#1EC8A5] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Paste CSV Text
                </button>
              </div>

              {/* Preset Description */}
              {inputMode === 'preset' && (
                <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-[#065F46]">Exercise Provided Dataset</h4>
                    <p className="text-xs text-[#047857] leading-relaxed">
                      Contains 19 test settlement records covering all required technical scenarios:
                      primary lifecycle matches, fallback composite keys (Corner Deli, Shell Gas), multi-tranche partials,
                      complex refund credits (Apple), over-settlement (Walmart), and quarantined unmatched records (Disney Plus).
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload Zone */}
              {inputMode === 'file' && (
                <div className="border-2 border-dashed border-slate-300 hover:border-[#1EC8A5] rounded-xl p-6 sm:p-8 text-center transition-colors bg-slate-50">
                  <input
                    type="file"
                    accept=".csv"
                    id="csvFileInput"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="csvFileInput" className="cursor-pointer block">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <span className="text-sm font-semibold text-slate-900 block">
                      {selectedFile ? selectedFile.name : 'Click to select or drag and drop a settlement CSV'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Supported format: UTF-8 CSV with required headers • Max 10MB
                    </span>
                  </label>
                </div>
              )}

              {/* Raw Text Input */}
              {inputMode === 'paste' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Paste CSV Data
                  </label>
                  <textarea
                    rows={7}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency&#10;SET001,LC001,ACC123,..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/10"
                  />
                </div>
              )}
            </div>
          )}

          {/* ──────────────── STAGE 2: PREVIEW & VALIDATION ──────────────── */}
          {stage === 'PREVIEW' && previewData && (
            <div className="space-y-4">
              {/* File Metadata & Diagnostics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Rows</span>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-1">{previewData.totalRows}</p>
                </div>
                <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0]">
                  <span className="text-[10px] text-[#059669] uppercase font-semibold">Valid Matches</span>
                  <p className="text-xl font-bold font-mono text-[#059669] mt-1">{previewData.validRows}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Safe Duplicates</span>
                  <p className="text-xl font-bold font-mono text-slate-700 mt-1">{previewData.duplicateRows}</p>
                </div>
                <div className="p-3 bg-[#FFF1F2] rounded-xl border border-[#FECDD3]">
                  <span className="text-[10px] text-[#E11D48] uppercase font-semibold">Issues / Warnings</span>
                  <p className="text-xl font-bold font-mono text-[#E11D48] mt-1">{previewData.invalidRows}</p>
                </div>
              </div>

              {/* Pre-Import Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Pre-Import Diagnostic Preview ({previewData.previewRows.length} sample rows)
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {previewData.fileName} • {(previewData.fileSizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                      <tr>
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Settlement ID</th>
                        <th className="px-3 py-2">Merchant</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2">Validation Status</th>
                        <th className="px-3 py-2">Diagnostic Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.previewRows.map((row) => (
                        <tr key={row.row_number} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-slate-400">{row.row_number}</td>
                          <td className="px-3 py-2 font-bold text-[#1EC8A5]">{row.settlement_id}</td>
                          <td className="px-3 py-2 font-sans font-medium text-slate-800">{row.merchant_name}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">
                            ${row.settlement_amount ? row.settlement_amount.toFixed(2) : '0.00'}
                          </td>
                          <td className="px-3 py-2 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                row.status === 'VALID_MATCH'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : row.status === 'DUPLICATE'
                                  ? 'bg-slate-100 text-slate-700'
                                  : row.status === 'POTENTIAL_UNMATCHED'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {row.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-sans text-slate-500 text-[11px] truncate max-w-xs">
                            {row.status_message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── STAGE 3: RESULT REPORT ──────────────── */}
          {stage === 'RESULT' && result && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Reconciliation Completed Successfully</h4>
                    <p className="text-xs text-emerald-700 font-mono">
                      Run Reference: {result.runId || 'N/A'} • All SQLite updates committed
                    </p>
                  </div>
                </div>
                {result.runId && (result.summary.invalidRecords > 0 || result.summary.unmatchedRecords > 0) && (
                  <a
                    href={getRejectedItemsExportUrl(result.runId)}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Rejected CSV
                  </a>
                )}
              </div>

              {/* Execution Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Records Read</span>
                  <p className="text-xl font-bold font-mono text-slate-900 mt-1">{result.summary.recordsRead}</p>
                </div>
                <div className="p-3 bg-[#ECFDF5] rounded-xl border border-[#A7F3D0]">
                  <span className="text-[10px] text-[#059669] uppercase font-semibold">Inserted</span>
                  <p className="text-xl font-bold font-mono text-[#059669] mt-1">{result.summary.newSettlementsInserted}</p>
                </div>
                <div className="p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]">
                  <span className="text-[10px] text-[#D97706] uppercase font-semibold">Duplicates Skipped</span>
                  <p className="text-xl font-bold font-mono text-[#D97706] mt-1">{result.summary.duplicatesSkipped}</p>
                </div>
                <div className="p-3 bg-[#FFF1F2] rounded-xl border border-[#FECDD3]">
                  <span className="text-[10px] text-[#E11D48] uppercase font-semibold">Unmatched</span>
                  <p className="text-xl font-bold font-mono text-[#E11D48] mt-1">{result.summary.unmatchedRecords}</p>
                </div>
              </div>

              {/* Unmatched / Quarantined Entries */}
              {result.unmatched && result.unmatched.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                  <span className="text-xs font-semibold text-[#E11D48] block">
                    Unmatched / Quarantined Records ({result.unmatched.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                    {result.unmatched.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-2">
                        <span className="text-[#D97706] font-semibold">{item.settlement_id}</span>
                        <span className="text-slate-500 text-right flex-1">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflicting Duplicate Records & Validation Errors */}
              {result.errors && result.errors.length > 0 && (
                <div className="bg-rose-50/80 rounded-xl border border-rose-200 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Conflicting Duplicates & Rejected Rows ({result.errors.length})</span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                    {result.errors.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-rose-200 flex items-start justify-between gap-2">
                        <span className="text-rose-700 font-bold shrink-0">{item.recordId || `Row ${item.rowNumber}`}</span>
                        <span className="text-slate-700 font-sans text-[11px] text-right flex-1">{item.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          {stage === 'INPUT' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleValidateAndPreview}
                disabled={previewLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1EC8A5] hover:bg-[#19B494] text-white font-bold text-xs shadow-md shadow-[#1EC8A5]/25 disabled:opacity-50 transition-all"
              >
                {previewLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Validating CSV...</span>
                  </>
                ) : (
                  <>
                    <span>Validate & Preview CSV</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {stage === 'PREVIEW' && (
            <>
              <button
                onClick={() => setStage('INPUT')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Back to Edit
              </button>
              <button
                onClick={handleConfirmAndIngest}
                disabled={processing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 disabled:opacity-50 transition-all"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Committing to SQLite...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Commit Reconciliation</span>
                  </>
                )}
              </button>
            </>
          )}

          {stage === 'RESULT' && (
            <>
              <div />
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-[#1EC8A5] hover:bg-[#19B494] text-white font-bold text-xs shadow-md transition-all"
              >
                Close & View Live Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
