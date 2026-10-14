import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
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
import { RefreshCw } from 'lucide-react';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [evaluationDate, setEvaluationDate] = useState('');
  const [search, setSearch] = useState('');
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Session verification loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1B4C] flex flex-col items-center justify-center space-y-4 text-white font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#1EC8A5]/20 border border-[#1EC8A5]/40 flex items-center justify-center p-2">
          <RefreshCw className="w-6 h-6 text-[#1EC8A5] animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold tracking-tight">Verifying Auditor Session...</p>
          <p className="text-xs text-[#9EA5C7] font-mono mt-1">Open Fabric Security Guard</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
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

        {/* Footer */}
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
  );
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return null;
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
