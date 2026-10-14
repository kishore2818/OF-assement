import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Database, 
  Search, 
  AlertCircle, 
  Sliders, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  Trash2,
  FileUp,
  X,
  ShieldCheck
} from 'lucide-react';
import { getTransactions, createTransaction, deleteTransaction } from '../services/api';
import { TransactionImportModal } from './TransactionImportModal';

const STATUS_OPTIONS = ['COMPLETED', 'PENDING', 'FAILED', 'DECLINED'];

export function SettingsPage({ evaluationDate, setEvaluationDate, onDataChanged }) {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'engine'
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [search, setSearch] = useState('');

  // New Record State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    transaction_id: '',
    lifecycle_id: '',
    account_id: 'ACC101',
    merchant_name: '',
    transaction_amount: '',
    currency: 'USD',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'COMPLETED'
  });
  const [isCreating, setIsCreating] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch transactions list
  const loadTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTransactions({ evaluationDate });
      if (res.success && res.data) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to load transactions for settings:', err);
      setError(err.message || 'Failed to fetch transaction records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [evaluationDate]);

  // Create Handlers
  const handleOpenCreateModal = () => {
    setCreateForm({
      transaction_id: `TXN${String(transactions.length + 1).padStart(3, '0')}`,
      lifecycle_id: `LC${String(transactions.length + 1).padStart(3, '0')}`,
      account_id: 'ACC101',
      merchant_name: '',
      transaction_amount: '',
      currency: 'USD',
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'COMPLETED'
    });
    setIsCreateModalOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSaveNewRecord = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!createForm.transaction_id.trim()) {
      setError('Transaction ID is required.');
      return;
    }
    if (!createForm.account_id.trim()) {
      setError('Account ID is required.');
      return;
    }
    if (!createForm.merchant_name.trim()) {
      setError('Merchant name is required.');
      return;
    }
    const numAmount = parseFloat(createForm.transaction_amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid transaction amount.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await createTransaction({
        transaction_id: createForm.transaction_id,
        lifecycle_id: createForm.lifecycle_id,
        account_id: createForm.account_id,
        merchant_name: createForm.merchant_name,
        transaction_amount: numAmount,
        currency: createForm.currency,
        transaction_date: createForm.transaction_date,
        status: createForm.status
      });

      if (res.success) {
        setSuccessMessage(`Transaction ${createForm.transaction_id} created successfully and added to database.`);
        setIsCreateModalOpen(false);
        await loadTransactions();
        if (onDataChanged) onDataChanged();
      } else {
        setError(res.error || 'Failed to create record.');
      }
    } catch (err) {
      console.error('Create transaction error:', err);
      setError(err.message || 'Failed to create transaction.');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Handlers
  const handleDelete = async (transactionId) => {
    setIsDeleting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await deleteTransaction(transactionId);
      if (res.success) {
        setSuccessMessage(`Transaction ${transactionId} deleted from database.`);
        setDeletingId(null);
        await loadTransactions();
        if (onDataChanged) onDataChanged();
      } else {
        setError(res.error || 'Failed to delete transaction.');
      }
    } catch (err) {
      console.error('Delete transaction error:', err);
      setError(err.message || 'Failed to delete transaction.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (t.transaction_id && t.transaction_id.toLowerCase().includes(q)) ||
      (t.lifecycle_id && t.lifecycle_id.toLowerCase().includes(q)) ||
      (t.merchant_name && t.merchant_name.toLowerCase().includes(q)) ||
      (t.account_id && t.account_id.toLowerCase().includes(q)) ||
      (t.settlement_status && t.settlement_status.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D8E6] shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1EC8A5]" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F1B4C]">Ledger Management & Config</h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5B6487] mt-1">
            Audit-grade immutable transaction ledger. You can add new ledger transactions or import batch files. Historical transaction data remains immutable to preserve audit integrity.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-[#F7F9FC] p-1 rounded-xl border border-[#D1D8E6] self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-[#0F1B4C] text-white shadow-xs'
                : 'text-[#5B6487] hover:text-[#0F1B4C]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Transactions ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('engine')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'engine'
                ? 'bg-[#0F1B4C] text-white shadow-xs'
                : 'text-[#5B6487] hover:text-[#0F1B4C]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Engine Config
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: Transactions View */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-[#D1D8E6] shadow-card overflow-hidden">
          {/* Action Toolbar */}
          <div className="p-4 sm:p-5 border-b border-[#D1D8E6]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-b from-white to-[#F7F9FC]/40">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F1B4C]">
                Transactions Ledger ({filteredTransactions.length} of {transactions.length})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Live SQLite Sync
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                Immutable Ledger
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#5B6487] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ID, Lifecycle, Merchant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl text-xs font-mono text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5] focus:ring-1 focus:ring-[#1EC8A5] w-52 sm:w-60"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3 py-1.5 bg-[#0F1B4C] hover:bg-[#1A2B6B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                title="Import transactions from PDF, CSV or pasted text"
              >
                <FileUp className="w-4 h-4 text-[#1EC8A5]" />
                <span>Import (PDF / CSV)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-3 py-1.5 bg-[#1EC8A5] hover:bg-[#16a789] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Record</span>
              </button>

              <button
                type="button"
                onClick={loadTransactions}
                disabled={isLoading}
                title="Refresh from Database"
                className="p-1.5 text-[#5B6487] hover:text-[#0F1B4C] hover:bg-[#F7F9FC] rounded-lg border border-[#D1D8E6] transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1EC8A5]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0F1B4C] text-white text-[11px] uppercase tracking-wider font-extrabold select-none">
                  <th className="py-3 px-3.5">Txn ID</th>
                  <th className="py-3 px-3.5">Lifecycle ID</th>
                  <th className="py-3 px-3.5">Account</th>
                  <th className="py-3 px-3.5">Merchant Name</th>
                  <th className="py-3 px-3.5">Amount</th>
                  <th className="py-3 px-3.5">Currency</th>
                  <th className="py-3 px-3.5">Txn Date</th>
                  <th className="py-3 px-3.5">Processing Status</th>
                  <th className="py-3 px-3.5">Settlement Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1D8E6]/60 font-mono text-[11px]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-[#5B6487]">
                      {isLoading ? 'Loading transaction records from database...' : 'No transactions match search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => {
                    return (
                      <tr key={txn.transaction_id} className="hover:bg-[#F7F9FC] transition-colors group">
                        <td className="py-3 px-3.5 font-bold text-[#0F1B4C]">
                          {txn.transaction_id}
                        </td>
                        <td className="py-3 px-3.5 text-[#5B6487]">
                          {txn.lifecycle_id || <span className="text-slate-400 italic">None</span>}
                        </td>
                        <td className="py-3 px-3.5 text-[#5B6487]">
                          {txn.account_id}
                        </td>
                        <td className="py-3 px-3.5 font-sans font-medium text-[#0F1B4C]">
                          {txn.merchant_name}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-[#0F1B4C]">
                          ${Number(txn.transaction_amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-3.5 text-[#5B6487]">
                          {txn.currency}
                        </td>
                        <td className="py-3 px-3.5 text-[#5B6487]">
                          {txn.transaction_date}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                            txn.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : txn.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                            txn.settlement_status === 'FULLY_SETTLED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : txn.settlement_status === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : txn.settlement_status === 'OVER_SETTLED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : txn.settlement_status === 'REFUNDED'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {txn.settlement_status || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDeletingId(txn.transaction_id)}
                            className="inline-flex items-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete transaction record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-[#F7F9FC] border-t border-[#D1D8E6]/60 text-[11px] text-[#5B6487] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Audit rule: Transactions are append-only to guarantee financial ledger integrity across reconciliation runs.</span>
            <span className="font-mono text-[10px] text-slate-400">PRAGMA journal_mode = WAL</span>
          </div>
        </div>
      )}

      {/* TAB 2: Engine Config */}
      {activeTab === 'engine' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D1D8E6] shadow-card space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5B6487] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1EC8A5]" />
              Default Evaluation Date
            </label>
            <input
              type="date"
              value={evaluationDate}
              onChange={(e) => setEvaluationDate(e.target.value)}
              className="w-full max-w-xs bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl px-3.5 py-2 text-xs font-mono text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5] focus:ring-2 focus:ring-[#1EC8A5]/10"
            />
            <p className="text-xs text-[#5B6487]">
              Controls the reference date used for flagging unsettled transactions exceeding the 7-day threshold.
            </p>
          </div>

          <div className="pt-4 border-t border-[#D1D8E6]/60 space-y-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-[#5B6487] block">
              Database Information
            </span>
            <div className="flex items-center justify-between py-2 border-b border-[#F7F9FC]">
              <span className="text-[#5B6487]">Engine</span>
              <span className="font-mono font-semibold text-[#0F1B4C]">better-sqlite3 v11</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F7F9FC]">
              <span className="text-[#5B6487]">Foreign Keys</span>
              <span className="font-mono font-semibold text-[#059669]">PRAGMA foreign_keys = ON</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#F7F9FC]">
              <span className="text-[#5B6487]">Precision Mode</span>
              <span className="font-mono font-semibold text-[#1EC8A5]">Integer-Cents (IEEE-754 Safe)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#5B6487]">Matching Strategy</span>
              <span className="font-mono font-semibold text-[#0F1B4C]">Two-Tier (Lifecycle + Composite)</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TRANSACTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F1B4C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D1D8E6] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#D1D8E6] flex items-center justify-between bg-gradient-to-r from-white to-[#F7F9FC]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#1EC8A5]/10 text-[#1EC8A5] rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F1B4C]">Add New Transaction</h3>
                  <p className="text-xs text-[#5B6487]">Insert a new transaction into SQLite ledger</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-[#0F1B4C] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Transaction ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN017"
                    value={createForm.transaction_id}
                    onChange={(e) => setCreateForm({ ...createForm, transaction_id: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-mono text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Lifecycle ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. LC015"
                    value={createForm.lifecycle_id}
                    onChange={(e) => setCreateForm({ ...createForm, lifecycle_id: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-mono text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Account ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ACC140"
                    value={createForm.account_id}
                    onChange={(e) => setCreateForm({ ...createForm, account_id: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-mono text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Merchant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple Store"
                    value={createForm.merchant_name}
                    onChange={(e) => setCreateForm({ ...createForm, merchant_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-sans text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6487] font-mono">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={createForm.transaction_amount}
                      onChange={(e) => setCreateForm({ ...createForm, transaction_amount: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-mono text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Currency</label>
                  <input
                    type="text"
                    maxLength="3"
                    value={createForm.currency}
                    onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-mono uppercase text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.transaction_date}
                    onChange={(e) => setCreateForm({ ...createForm, transaction_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-mono text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0F1B4C] uppercase text-[10px] tracking-wider">Processing Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F9FC] border border-[#D1D8E6] rounded-xl font-sans font-bold text-[#0F1B4C] focus:outline-none focus:border-[#1EC8A5]"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D1D8E6] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#F7F9FC] hover:bg-[#D1D8E6] text-[#5B6487] font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#1EC8A5] hover:bg-[#16a789] text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {isCreating ? 'Saving...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-[#0F1B4C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D1D8E6] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0F1B4C]">Delete Transaction</h3>
                <p className="text-xs text-[#5B6487]">Are you sure you want to delete <span className="font-mono font-bold text-[#0F1B4C]">{deletingId}</span>?</p>
              </div>
            </div>

            <p className="text-xs text-[#5B6487]">
              This will remove the transaction record from SQLite and detach any matching settlement records back to unmatched state. The entire dashboard and metrics will recalculate immediately.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-[#F7F9FC] hover:bg-[#D1D8E6] text-[#5B6487] font-bold rounded-xl transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      <TransactionImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          loadTransactions();
          if (onDataChanged) onDataChanged();
        }}
      />
    </div>
  );
}
