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
  const [inputMode, setInputMode] = useState('preset');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">Ingest & Reconcile Settlement CSV</h3>
              <p className="text-xs text-[#64748B]">Match processor tranches and update ledger balances</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] text-xs font-semibold">
            <button
              onClick={() => { setInputMode('preset'); setResult(null); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'preset' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Exercise Provided Dataset
            </button>
            <button
              onClick={() => { setInputMode('file'); setResult(null); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'file' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Upload File
            </button>
            <button
              onClick={() => { setInputMode('paste'); setResult(null); }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                inputMode === 'paste' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              Paste CSV
            </button>
          </div>

          {/* Preset Info */}
          {inputMode === 'preset' && (
            <div className="rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#15803D]">Authoritative Exercise Dataset</h4>
                <p className="text-xs text-[#166534] mt-1 leading-relaxed">
                  Includes 19 test settlement records from the assignment, covering primary lifecycle matches, fallback composite matches (Corner Deli, Shell Gas), partial tranches, complex refund credits, over-settlement (Walmart), and unmatched records (Disney Plus, failed Amazon, Uber Taxi).
                </p>
              </div>
            </div>
          )}

          {/* File Upload Zone */}
          {inputMode === 'file' && (
            <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] rounded-xl p-8 text-center transition-colors bg-[#F8FAFC]">
              <input
                type="file"
                accept=".csv"
                id="csvFileInput"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="csvFileInput" className="cursor-pointer block">
                <UploadCloud className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
                <span className="text-sm font-semibold text-[#111827] block">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop a settlement CSV'}
                </span>
                <span className="text-xs text-[#64748B] mt-1 block">Supported format: UTF-8 CSV with standard header fields</span>
              </label>
            </div>
          )}

          {/* Raw Text Input */}
          {inputMode === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">
                Paste CSV Data
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency&#10;SET001,LC001,ACC123,..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          )}

          {/* Error notification */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Execution Results View */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  Reconciliation Execution Report
                </h4>
                <span className="text-[11px] font-mono text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#DCFCE7]">
                  Status: Completed
                </span>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] uppercase font-semibold">Records Read</span>
                  <p className="text-xl font-bold text-[#111827] mt-1">{result.summary.recordsRead}</p>
                </div>
                <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#DCFCE7]">
                  <span className="text-[10px] text-[#16A34A] uppercase font-semibold">Inserted</span>
                  <p className="text-xl font-bold text-[#16A34A] mt-1">{result.summary.newSettlementsInserted}</p>
                </div>
                <div className="p-3 bg-[#FFFBEB] rounded-xl border border-[#FEF3C7]">
                  <span className="text-[10px] text-[#D97706] uppercase font-semibold">Duplicates</span>
                  <p className="text-xl font-bold text-[#D97706] mt-1">{result.summary.duplicatesSkipped}</p>
                </div>
                <div className="p-3 bg-[#FEF2F2] rounded-xl border border-[#FEE2E2]">
                  <span className="text-[10px] text-[#DC2626] uppercase font-semibold">Unmatched</span>
                  <p className="text-xl font-bold text-[#DC2626] mt-1">{result.summary.unmatchedRecords}</p>
                </div>
              </div>

              {/* Unmatched / Quarantined Records Details */}
              {result.unmatched && result.unmatched.length > 0 && (
                <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3 space-y-2">
                  <span className="text-xs font-semibold text-[#DC2626] block">
                    Unmatched / Quarantined Entries ({result.unmatched.length})
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono">
                    {result.unmatched.map((item, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg text-xs border border-[#E2E8F0] flex items-start justify-between gap-2">
                        <span className="text-[#D97706] font-semibold">{item.settlement_id}</span>
                        <span className="text-[#64748B] text-right flex-1">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#111827] transition-colors"
          >
            {result ? 'Done' : 'Cancel'}
          </button>

          <button
            onClick={handleRunReconciliation}
            disabled={processing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-[#2563EB]/20 disabled:opacity-50 transition-all"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
