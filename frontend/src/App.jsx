import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { ReconciliationModal } from './pages/ReconciliationModal';

export default function App() {
  const [evaluationDate, setEvaluationDate] = useState('2025-08-15');
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        {/* Navigation Bar */}
        <Navbar
          onOpenReconcile={() => setIsReconcileModalOpen(true)}
          evaluationDate={evaluationDate}
          setEvaluationDate={setEvaluationDate}
          onDataReset={triggerRefresh}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route
              path="/"
              element={<DashboardPage evaluationDate={evaluationDate} refreshKey={refreshKey} />}
            />
            <Route
              path="/transactions"
              element={<TransactionsPage evaluationDate={evaluationDate} refreshKey={refreshKey} />}
            />
            <Route
              path="/transactions/:id"
              element={<TransactionDetailPage evaluationDate={evaluationDate} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Reconciliation Ingestion Modal */}
        <ReconciliationModal
          isOpen={isReconcileModalOpen}
          onClose={() => setIsReconcileModalOpen(false)}
          onReconciled={triggerRefresh}
        />

        {/* System Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500 font-mono">
          <p>Transaction Reconciliation System • Financial Operations Hub • SQLite & Express Engine</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
