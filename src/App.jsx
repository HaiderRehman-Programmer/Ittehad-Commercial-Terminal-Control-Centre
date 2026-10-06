import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import api from './lib/api';
import Sidebar from './components/Sidebar';
import { GlobalSearch } from './components/GlobalSearch';
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const MapPage = React.lazy(() => import('./pages/MapPage'));
const WalletAdmin = React.lazy(() => import('./pages/WalletAdmin'));
const Tokens = React.lazy(() => import('./pages/Tokens'));
const NewToken = React.lazy(() => import('./pages/NewToken'));
const UserGuide = React.lazy(() => import('./pages/UserGuide'));
const InstallmentTypes = React.lazy(() => import('./pages/InstallmentTypes'));
const Towns = React.lazy(() => import('./pages/Towns'));
const TownOwners = React.lazy(() => import('./pages/TownOwners'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const RoleManagement = React.lazy(() => import('./pages/RoleManagement'));
const Customers = React.lazy(() => import('./pages/Customers'));
const LandOwners = React.lazy(() => import('./pages/LandOwners'));
const FinancialCustomers = React.lazy(() => import('./pages/FinancialCustomers'));
const RecoverySheet = React.lazy(() => import('./pages/RecoverySheet'));
const CustomerRecoverySheet = React.lazy(() => import('./pages/CustomerRecoverySheet'));
const NewBooking = React.lazy(() => import('./pages/NewBooking'));
const Bookings = React.lazy(() => import('./pages/Bookings'));
const IncomePage = React.lazy(() => import('./pages/IncomePage'));
const IncomeStatement = React.lazy(() => import('./pages/IncomeStatement'));
const CashFlowStatement = React.lazy(() => import('./pages/CashFlowStatement'));
const TrialBalance = React.lazy(() => import('./pages/TrialBalance'));
const BalanceSheet = React.lazy(() => import('./pages/BalanceSheet'));
const PendingPayments = React.lazy(() => import('./pages/PendingPayments'));
const TransferRequests = React.lazy(() => import('./pages/TransferRequests'));
const Visitors = React.lazy(() => import('./pages/Visitors'));
const Equity = React.lazy(() => import('./pages/Equity'));
const Assets = React.lazy(() => import('./pages/Assets'));
const Expense = React.lazy(() => import('./pages/Expense'));
const Liability = React.lazy(() => import('./pages/Liability'));
const CustomerLedger = React.lazy(() => import('./pages/CustomerLedger'));
const Agents = React.lazy(() => import('./pages/Agents'));
const DecadeFiscalReport = React.lazy(() => import('./pages/DecadeFiscalReport'));
const CustomerProfile = React.lazy(() => import('./pages/CustomerProfile'));
const Plots = React.lazy(() => import('./pages/Plots'));
const Login = React.lazy(() => import('./pages/Login'));
const AuditLog = React.lazy(() => import('./pages/AuditLog'));
const TownOwnerAudit = React.lazy(() => import('./pages/TownOwnerAudit'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
import { Search, ShieldCheck } from 'lucide-react';
import { Bell, User, LogOut } from 'lucide-react';
import { useToast } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-slate-100 rounded-2xl"></div>
      <div className="absolute inset-0 border-4 border-indigo-600 rounded-2xl animate-spin border-t-transparent"></div>
    </div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
      Syncing Terminal Data...
    </div>
  </div>
);

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Layout = ({ isAuthenticated, setAuth }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/forgot-password';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setAuth(false);
  };

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <div className="app-container">
        <GlobalSearch />
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="main-content-offset"
          >
            <header className="glass-header sticky top-0 z-[100] h-20 flex items-center justify-between px-8 shadow-sm">
            {/* Project Identity */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-600 lg:hidden border border-slate-200"
              >
                <span className="text-xl leading-none flex items-center justify-center">☰</span>
              </button>
              <div className="flex flex-col">
                <span className="text-[14px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">
                  {import.meta.env.VITE_APP_PROJECT_TITLE || "Terminal Control"}
                </span>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Internal Operating Terminal</span>
                </div>
              </div>
            </div>

            {/* User Security Matrix */}
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                 <ShieldCheck size={14} className="text-indigo-600" />
                 <span className="text-[11px] font-black text-indigo-700 uppercase tracking-tighter">Verified Audit</span>
              </div>

              <div className="relative border-l border-slate-100 pl-6 h-10 flex items-center">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="text-right hidden sm:block">
                     <div className="text-[13px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-none mb-1 uppercase tracking-tight">HI, {user.name?.split(' ')[0] || 'ADMIN'} !</div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none tracking-tighter">{user.role || 'Super Admin'}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl border border-indigo-100 p-0.5 group-hover:border-indigo-400 transition-all shadow-sm overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    {user.name?.charAt(0) || 'A'}
                  </div>
                </div>

                {showUserMenu && (
                  <div className="absolute top-[calc(100%+16px)] right-0 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 bg-slate-50/50 border-b border-slate-100">
                       <div className="text-[12px] font-black text-slate-800 leading-none mb-1">{user.name || 'Administrator'}</div>
                       <div className="text-[10px] text-slate-500 font-medium truncate">{user.email || 'admin@realestate.com'}</div>
                    </div>
                    
                    <div className="p-2">
                       <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-rose-500 font-black hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest">
                          <LogOut size={18} />
                          <span>Lock Terminal</span>
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          <ErrorBoundary>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/wallet" element={<WalletAdmin />} />
                <Route path="/sale/tokens" element={<Tokens />} />
                <Route path="/sale/new-token" element={<NewToken />} />
                <Route path="/settings/user-guide" element={<UserGuide />} />
                <Route path="/settings/installments" element={<InstallmentTypes />} />
                <Route path="/settings/towns" element={<Towns />} />
                <Route path="/settings/users" element={<UserManagement />} />
                <Route path="/settings/roles" element={<RoleManagement />} />
                <Route path="/audit-log" element={<AuditLog />} />
                <Route path="/land-management/customers" element={<Customers />} />
                <Route path="/land-management/land-owners" element={<LandOwners />} />
                <Route path="/land-management/town-owners" element={<TownOwners />} />
                <Route path="/land-management/plots" element={<Plots />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/financial-customers" element={<FinancialCustomers />} />
                <Route path="/sale/recovery-sheet" element={<RecoverySheet />} />
                <Route path="/sale/new-booking" element={<NewBooking />} />
                <Route path="/sale/bookings" element={<Bookings />} />
                <Route path="/customer-profile/:id" element={<CustomerProfile />} />
                <Route path="/customers/recovery" element={<CustomerRecoverySheet />} />
                <Route path="/income" element={<IncomePage />} />
                <Route path="/reports/income-statement" element={<IncomeStatement />} />
                <Route path="/reports/cash-flow" element={<CashFlowStatement />} />
                <Route path="/reports/trial" element={<TrialBalance />} />
                <Route path="/reports/balance-sheet" element={<BalanceSheet />} />
                <Route path="/pending-payments" element={<PendingPayments />} />
                <Route path="/transfer-requests" element={<TransferRequests />} />
                <Route path="/visitors" element={<Visitors />} />
                <Route path="/equity" element={<Equity />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/expense" element={<Expense />} />
                <Route path="/liability" element={<Liability />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/customer-ledger/:id" element={<CustomerLedger />} />
                <Route path="/reports/decade-fiscal" element={<DecadeFiscalReport />} />
                <Route path="/reports/town-owner-audit" element={<TownOwnerAudit />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </ErrorBoundary>

          <motion.footer 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }}
            style={{padding: '24px', textAlign: 'center', borderTop: '1px solid #e5e7eb', fontSize: '10px', color: '#9ca3af', marginTop: 'auto'}}
          >
            COPYRIGHT © 2026 | ALL RIGHTS RESERVED.
          </motion.footer>
        </motion.main>
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return Boolean(token);
  });
  const toast = useToast();
  const prevSoldRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return; // Don't poll when logged out
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/dashboard/metrics');
        const currentSold = res.data.soldShop;
        if (prevSoldRef.current !== null && currentSold > prevSoldRef.current) {
          toast?.success(`New Plot Booked! Total Sold: ${currentSold}`);
        }
        prevSoldRef.current = currentSold;
      } catch (err) {
        console.warn('Polling error:', err.message);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, toast]);

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { 
            background: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(255,255,255,0.3)', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            color: '#1e293b',
            borderRadius: '16px'
          }
        }} 
      />
      <Router>
        <Layout isAuthenticated={isAuthenticated} setAuth={setIsAuthenticated} />
      </Router>
    </>
  );
};

export default App;
