import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettlementsPage } from './pages/SettlementsPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { ReconciliationRunsPage } from './pages/ReconciliationRunsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { ReconciliationModal } from './pages/ReconciliationModal';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [evaluationDate, setEvaluationDate] = useState('');
  const [search, setSearch] = useState('');
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-[#F7F9FC] text-[#0F1B4C] flex font-sans pb-16 lg:pb-0">
        {/* Deep Obsidian Sidebar (Docked on desktop, drawer on mobile) */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onOpenReconcile={() => setIsReconcileModalOpen(true)}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Header with Mobile Hamburger, Search, Date Filter, and Reconcile Button */}
          <Header
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            search={search}
            setSearch={setSearch}
            evaluationDate={evaluationDate}
            setEvaluationDate={setEvaluationDate}
            onOpenReconcile={() => setIsReconcileModalOpen(true)}
            onDataReset={triggerRefresh}
          />

          {/* Main Pages Container (With pb-24 on mobile for bottom nav) */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 lg:pb-12">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    evaluationDate={evaluationDate}
                    refreshKey={refreshKey}
                    search={search}
                    onOpenReconcile={() => setIsReconcileModalOpen(true)}
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
                path="/exceptions"
                element={
                  <ExceptionsPage
                    evaluationDate={evaluationDate}
                    refreshKey={refreshKey}
                  />
                }
              />
              <Route
                path="/discrepancies"
                element={
                  <ExceptionsPage
                    evaluationDate={evaluationDate}
                    refreshKey={refreshKey}
                  />
                }
              />
              <Route
                path="/runs"
                element={<ReconciliationRunsPage refreshKey={refreshKey} />}
              />
              <Route
                path="/reports"
                element={<ReportsPage evaluationDate={evaluationDate} refreshKey={refreshKey} />}
              />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    evaluationDate={evaluationDate}
                    setEvaluationDate={setEvaluationDate}
                    onDataChanged={triggerRefresh}
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

          {/* Footer (Hidden on mobile to save vertical space) */}
          <footer className="hidden lg:block border-t border-[#D1D8E6]/60 bg-white py-6 text-center text-xs text-[#5B6487] font-mono mt-auto px-4">
            <p>Open Fabric Reconcile • High-Precision Ledger Reconciliation Engine • SQLite Node</p>
          </footer>
        </div>

        {/* Mobile Sticky Bottom Navigation Bar */}
        <BottomNav onOpenReconcile={() => setIsReconcileModalOpen(true)} />

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
