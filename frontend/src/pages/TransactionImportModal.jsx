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
  Database,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { bulkCreateTransactions } from '../services/api';
import { extractTextFromPdf, parseTransactionText } from '../utils/pdfTransactionParser';

const SAMPLE_CSV_TRANSACTIONS = `transaction_id,lifecycle_id,account_id,merchant_name,transaction_date,transaction_amount,currency,status
TXN021,LC021,ACC150,Stripe Payments,2025-08-16,450.00,USD,COMPLETED
TXN022,LC022,ACC151,Shopify Store,2025-08-16,128.50,USD,COMPLETED
TXN023,LC023,ACC152,DigitalOcean,2025-08-16,85.00,USD,COMPLETED
TXN024,LC024,ACC153,GitHub Enterprise,2025-08-16,210.00,USD,COMPLETED`;

export function TransactionImportModal({ isOpen, onClose, onImported }) {
  // Wizard Stages: 'INPUT' -> 'PREVIEW' -> 'RESULT'
  const [stage, setStage] = useState('INPUT');
  const [inputMode, setInputMode] = useState('pdf'); // 'pdf' | 'file' | 'paste' | 'preset'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  
  // Validation / Preview state
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRecords, setParsedRecords] = useState([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  function resetState() {
    setStage('INPUT');
    setSelectedFile(null);
    setPastedText('');
    setParsedRecords([]);
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
      setErrorMsg(null);
    }
  };

  // Stage 1 -> 2: Parse & Preview
  const handleValidateAndPreview = async () => {
    setErrorMsg(null);
    setIsParsing(true);

    try {
      let rawContent = '';

      if (inputMode === 'pdf') {
        if (!selectedFile) throw new Error('Please select a PDF document first.');
        rawContent = await extractTextFromPdf(selectedFile);
      } else if (inputMode === 'file') {
        if (!selectedFile) throw new Error('Please select a CSV or text file first.');
        rawContent = await selectedFile.text();
      } else if (inputMode === 'paste') {
        if (!pastedText.trim()) throw new Error('Please paste transaction records or CSV text.');
        rawContent = pastedText;
      } else {
        rawContent = SAMPLE_CSV_TRANSACTIONS;
      }

      const records = parseTransactionText(rawContent);
      if (!records || records.length === 0) {
        throw new Error('No valid transaction records could be parsed. Check that lines contain IDs (e.g. TXN001) and amounts.');
      }

      setParsedRecords(records);
      setStage('PREVIEW');
    } catch (err) {
      console.error('Parse error:', err);
      setErrorMsg(err.message || 'Failed to parse transactions.');
    } finally {
      setIsParsing(false);
    }
  };

  // Stage 2 -> 3: Commit to SQLite
  const handleCommit = async () => {
    setErrorMsg(null);
    setIsCommitting(true);

    try {
      const res = await bulkCreateTransactions(parsedRecords);
      if (res.success) {
        setResult(res);
        setStage('RESULT');
        if (onImported) onImported();
      } else {
        throw new Error(res.error || 'Failed to commit transactions to database.');
      }
    } catch (err) {
      console.error('Commit error:', err);
      setErrorMsg(err.message || 'Error saving to database.');
    } finally {
      setIsCommitting(false);
    }
  };

  const totalAmount = parsedRecords.reduce((sum, r) => sum + (r.transaction_amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#0F1B4C]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#D1D8E6] shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D1D8E6] flex items-center justify-between bg-gradient-to-r from-white to-[#F7F9FC]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0F1B4C] text-[#1EC8A5] rounded-xl shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F1B4C]">
                  {stage === 'INPUT' && 'Import Transaction Records'}
                  {stage === 'PREVIEW' && 'Pre-Import Validation & Staging Preview'}
                  {stage === 'RESULT' && 'Transactions Ingestion Complete'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1EC8A5]/10 text-[#1EC8A5] border border-[#1EC8A5]/20 font-mono">
                  {stage === 'INPUT' && 'Step 1 of 3'}
                  {stage === 'PREVIEW' && 'Step 2 of 3'}
                  {stage === 'RESULT' && 'Step 3 of 3 (Complete)'}
                </span>
              </div>
              <p className="text-xs text-[#5B6487]">
                {stage === 'INPUT' && 'Import multiple ledger records from PDF documents, CSV files, or pasted data.'}
                {stage === 'PREVIEW' && 'Review extracted transactions before committing directly into SQLite.'}
                {stage === 'RESULT' && 'Records successfully registered and reconciled with existing settlement batches.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 font-sans">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STAGE 1: INPUT */}
          {stage === 'INPUT' && (
            <div className="space-y-4">
              {/* Tab Mode Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-[#F7F9FC] rounded-xl border border-[#D1D8E6] text-xs font-semibold gap-1">
                <button
                  type="button"
                  onClick={() => setInputMode('pdf')}
                  className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                    inputMode === 'pdf' ? 'bg-[#0F1B4C] text-white shadow-xs font-bold' : 'text-[#5B6487] hover:text-[#0F1B4C]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Import from PDF
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                    inputMode === 'file' ? 'bg-[#0F1B4C] text-white shadow-xs font-bold' : 'text-[#5B6487] hover:text-[#0F1B4C]'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Upload CSV File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                    inputMode === 'paste' ? 'bg-[#0F1B4C] text-white shadow-xs font-bold' : 'text-[#5B6487] hover:text-[#0F1B4C]'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Paste Data / Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('preset')}
                  className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-center ${
                    inputMode === 'preset' ? 'bg-[#0F1B4C] text-white shadow-xs font-bold' : 'text-[#5B6487] hover:text-[#0F1B4C]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1EC8A5]" />
                  Preset Sample
                </button>
              </div>

              {/* Mode: PDF Upload */}
              {inputMode === 'pdf' && (
                <div className="border-2 border-dashed border-[#D1D8E6] hover:border-[#1EC8A5] rounded-2xl p-6 sm:p-8 text-center transition-colors bg-[#F7F9FC]">
                  <input
                    type="file"
                    accept=".pdf"
                    id="pdfDocInput"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="pdfDocInput" className="cursor-pointer block">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#0F1B4C]">
                      {selectedFile ? selectedFile.name : 'Click to select or drop a PDF statement / specification'}
                    </p>
                    <p className="text-xs text-[#5B6487] mt-1">
                      Extracts tables, SQL inserts, or text listings of transactions automatically using optical PDF parsing.
                    </p>
                  </label>
                  {selectedFile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D1D8E6] rounded-xl text-xs font-mono font-bold text-[#0F1B4C]">
                      <FileText className="w-3.5 h-3.5 text-[#1EC8A5]" />
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              )}

              {/* Mode: CSV Upload */}
              {inputMode === 'file' && (
                <div className="border-2 border-dashed border-[#D1D8E6] hover:border-[#1EC8A5] rounded-2xl p-6 sm:p-8 text-center transition-colors bg-[#F7F9FC]">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    id="csvTxnInput"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="csvTxnInput" className="cursor-pointer block">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#0F1B4C]">
                      {selectedFile ? selectedFile.name : 'Click to select CSV file with transactions'}
                    </p>
                    <p className="text-xs text-[#5B6487] mt-1">
                      Expected fields: transaction_id, lifecycle_id, account_id, merchant_name, transaction_date, amount
                    </p>
                  </label>
                  {selectedFile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D1D8E6] rounded-xl text-xs font-mono font-bold text-[#0F1B4C]">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#1EC8A5]" />
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              )}

              {/* Mode: Paste Text */}
              {inputMode === 'paste' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#5B6487]">Paste Transaction Lines or CSV</span>
                    <button
                      type="button"
                      onClick={() => setPastedText(SAMPLE_CSV_TRANSACTIONS)}
                      className="text-[#1EC8A5] hover:underline font-bold"
                    >
                      Fill Template Sample
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`transaction_id,lifecycle_id,account_id,merchant_name,transaction_date,transaction_amount\nTXN021,LC021,ACC150,Stripe Payments,2025-08-16,450.00\nTXN022,LC022,ACC151,Shopify Store,2025-08-16,128.50`}
                    className="w-full p-3 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-mono text-xs text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5] focus:ring-1 focus:ring-[#1EC8A5]"
                  />
                </div>
              )}

              {/* Mode: Preset Sample */}
              {inputMode === 'preset' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ready-to-Import Demo Batch (4 Transactions)</span>
                  </div>
                  <pre className="p-3 bg-white border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-950 overflow-x-auto">
                    {SAMPLE_CSV_TRANSACTIONS}
                  </pre>
                  <p className="text-emerald-700 text-[11px]">
                    Click Preview below to inspect how these transactions will be mapped into SQLite.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: PREVIEW */}
          {stage === 'PREVIEW' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#F7F9FC] p-3.5 rounded-xl border border-[#D1D8E6]">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#5B6487] block text-[10px] uppercase font-sans font-bold">Valid Records</span>
                    <span className="font-bold text-[#0F1B4C] text-sm">{parsedRecords.length} Rows</span>
                  </div>
                  <div className="h-6 w-px bg-[#D1D8E6]" />
                  <div>
                    <span className="text-[#5B6487] block text-[10px] uppercase font-sans font-bold">Total Ingest Value</span>
                    <span className="font-bold text-[#1EC8A5] text-sm">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStage('INPUT')}
                  className="px-2.5 py-1 text-xs text-[#5B6487] hover:text-[#0F1B4C] bg-white border border-[#D1D8E6] rounded-lg font-bold"
                >
                  Edit Input
                </button>
              </div>

              <div className="border border-[#D1D8E6] rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0F1B4C] text-white text-[10px] uppercase tracking-wider font-extrabold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Txn ID</th>
                      <th className="py-2.5 px-3">Lifecycle ID</th>
                      <th className="py-2.5 px-3">Account</th>
                      <th className="py-2.5 px-3">Merchant</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1D8E6]/60 font-mono text-[11px]">
                    {parsedRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-[#F7F9FC]">
                        <td className="py-2 px-3 font-bold text-[#0F1B4C]">{r.transaction_id}</td>
                        <td className="py-2 px-3 text-[#5B6487]">{r.lifecycle_id || '—'}</td>
                        <td className="py-2 px-3 text-[#5B6487]">{r.account_id}</td>
                        <td className="py-2 px-3 font-sans font-medium text-[#0F1B4C]">{r.merchant_name}</td>
                        <td className="py-2 px-3 text-[#5B6487]">{r.transaction_date}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#0F1B4C]">
                          ${Number(r.transaction_amount).toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {r.status || 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAGE 3: RESULT */}
          {stage === 'RESULT' && result && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-[#0F1B4C]">Import Execution Succeeded!</h4>
              <p className="text-xs text-[#5B6487] max-w-md mx-auto">
                {result.message}
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left font-mono text-xs pt-2">
                <div className="p-3 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl">
                  <span className="text-[10px] text-[#5B6487] font-sans block uppercase font-bold">Inserted Records</span>
                  <span className="text-base font-bold text-emerald-700">+{result.insertedCount}</span>
                </div>
                <div className="p-3 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl">
                  <span className="text-[10px] text-[#5B6487] font-sans block uppercase font-bold">Duplicate Skipped</span>
                  <span className="text-base font-bold text-[#5B6487]">{result.skippedCount}</span>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="text-left text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="font-bold block mb-1">Warnings during import:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#D1D8E6] flex items-center justify-between bg-[#F7F9FC]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-white hover:bg-[#D1D8E6]/40 text-[#5B6487] border border-[#D1D8E6] font-bold rounded-xl text-xs transition-all"
          >
            {stage === 'RESULT' ? 'Close' : 'Cancel'}
          </button>

          {stage === 'INPUT' && (
            <button
              type="button"
              onClick={handleValidateAndPreview}
              disabled={isParsing}
              className="px-4 py-2 bg-[#1EC8A5] hover:bg-[#16a789] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Parsing Data...
                </>
              ) : (
                <>
                  <span>Validate & Preview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}

          {stage === 'PREVIEW' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStage('INPUT')}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-[#5B6487] border border-[#D1D8E6] font-bold rounded-xl text-xs transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCommit}
                disabled={isCommitting}
                className="px-4 py-2 bg-[#1EC8A5] hover:bg-[#16a789] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Committing to SQLite...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Commit {parsedRecords.length} Records to DB</span>
                  </>
                )}
              </button>
            </div>
          )}

          {stage === 'RESULT' && (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-[#1EC8A5] hover:bg-[#16a789] text-white font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              Done & View Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
