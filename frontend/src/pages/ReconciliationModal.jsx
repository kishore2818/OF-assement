import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { runReconciliation } from '../services/api';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [inputMode, setInputMode] = useState('preset'); // 'preset', 'file', 'paste'
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRunReconciliation = async () => {
    try {
      setProcessing(true);
      setErrorMsg(null);
      setResult(null);

      let payload;
      if (inputMode === 'file') {
        if (!selectedFile) {
          setErrorMsg('Please select a CSV file first.');
          setProcessing(false);
          return;
        }
        payload = selectedFile;
      } else if (inputMode === 'paste') {
        if (!csvText.trim()) {
          setErrorMsg('Please paste CSV contents.');
          setProcessing(false);
          return;
        }
        payload = csvText;
      } else {
        // Preset default sample
        payload = DEFAULT_CSV_SAMPLE;
      }

      const res = await runReconciliation(payload);
      setResult(res);
      if (onReconciled) onReconciled();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingest & Reconcile Settlement CSV</h3>
              <p className="text-xs text-slate-400">Match processor tranches and update ledger balances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => { setInputMode('preset'); setResult(null); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'preset' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Exercise Provided Dataset
            </button>
            <button
              onClick={() => { setInputMode('file'); setResult(null); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'file' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Upload Custom File
            </button>
            <button
              onClick={() => { setInputMode('paste'); setResult(null); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'paste' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              Paste Raw CSV
            </button>
          </div>

          {/* Preset Info */}
          {inputMode === 'preset' && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">Authoritative Exercise Dataset</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Includes 19 test settlement records from the assignment, covering primary lifecycle matches, fallback composite matches (Corner Deli, Shell Gas), partial tranches, complex refund credits, over-settlement (Walmart), and unmatched records (Disney Plus, failed Amazon, Uber Taxi).
                </p>
              </div>
            </div>
          )}

          {/* File Upload Zone */}
          {inputMode === 'file' && (
            <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-8 text-center transition-colors">
              <input
                type="file"
                accept=".csv"
                id="csvFileInput"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="csvFileInput" className="cursor-pointer block">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <span className="text-sm font-semibold text-slate-200 block">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop a settlement CSV'}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">Supported format: UTF-8 CSV with standard header fields</span>
              </label>
            </div>
          )}

          {/* Raw Text Input */}
          {inputMode === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Paste CSV Data
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency&#10;SET001,LC001,ACC123,..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          )}

          {/* Error notification */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Execution Results View */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Reconciliation Execution Report
                </h4>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Status: Completed
                </span>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Records Read</span>
                  <p className="text-xl font-bold text-white mt-1">{result.summary.recordsRead}</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">Inserted</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{result.summary.newSettlementsInserted}</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold">Duplicates</span>
                  <p className="text-xl font-bold text-amber-400 mt-1">{result.summary.duplicatesSkipped}</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-rose-400 uppercase font-semibold">Unmatched</span>
                  <p className="text-xl font-bold text-rose-400 mt-1">{result.summary.unmatchedRecords}</p>
                </div>
              </div>

              {/* Unmatched / Quarantined Records Details */}
              {result.unmatched && result.unmatched.length > 0 && (
                <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 space-y-2">
                  <span className="text-xs font-semibold text-rose-300 block">
                    Unmatched / Quarantined Entries ({result.unmatched.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {result.unmatched.map((item, idx) => (
                      <div key={idx} className="p-2 bg-slate-950 rounded-lg text-xs font-mono border border-slate-800/80 flex items-start justify-between gap-2">
                        <span className="text-amber-400 font-semibold">{item.settlement_id}</span>
                        <span className="text-slate-400 text-right flex-1">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            {result ? 'Done' : 'Cancel'}
          </button>

          <button
            onClick={handleRunReconciliation}
            disabled={processing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 disabled:opacity-50 transition-all"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <span>Run Reconciliation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
