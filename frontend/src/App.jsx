import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { DiscrepanciesPage } from './pages/DiscrepanciesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { ReconciliationModal } from './pages/ReconciliationModal';

export default function App() {
  const [evaluationDate, setEvaluationDate] = useState('2025-08-15');
  const [search, setSearch] = useState('');
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex font-sans selection:bg-[#2563EB] selection:text-white">
        {/* Dark Navy Sidebar */}
        <Sidebar onOpenReconcile={() => setIsReconcileModalOpen(true)} />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Search, Date Filter, and Prominent Reconcile Button */}
          <Header
            search={search}
            setSearch={setSearch}
            evaluationDate={evaluationDate}
            setEvaluationDate={setEvaluationDate}
            onOpenReconcile={() => setIsReconcileModalOpen(true)}
            onDataReset={triggerRefresh}
          />

          {/* Main Pages Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 pt-8">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    evaluationDate={evaluationDate}
                    refreshKey={refreshKey}
                    search={search}
                  />
                }
              />
              <Route
                path="/transactions"
                element={
                  <TransactionsPage
                    evaluationDate={evaluationDate}
                    refreshKey={refreshKey}
                  />
                }
              />
              <Route
                path="/settlements"
                element={<SettlementsPage refreshKey={refreshKey} />}
              />
              <Route
                path="/discrepancies"
                element={
                  <DiscrepanciesPage
                    evaluationDate={evaluationDate}
                    refreshKey={refreshKey}
                  />
                }
              />
              <Route path="/reports" element={<ReportsPage />} />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    evaluationDate={evaluationDate}
                    setEvaluationDate={setEvaluationDate}
                  />
                }
              />
              <Route
                path="/transactions/:id"
                element={<TransactionDetailPage evaluationDate={evaluationDate} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-[#E2E8F0] bg-white py-6 text-center text-xs text-[#64748B] font-mono mt-12">
            <p>OpenFabric Reconcile • Transaction Reconciliation System • SQLite & Express Engine</p>
          </footer>
        </div>

        {/* Reconciliation Modal */}
        <ReconciliationModal
          isOpen={isReconcileModalOpen}
          onClose={() => setIsReconcileModalOpen(false)}
          onReconciled={triggerRefresh}
        />
      </div>
    </BrowserRouter>
  );
}
