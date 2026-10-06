import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Download,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Send,
  Calculator,
  RotateCcw
} from 'lucide-react';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
import { generateStrategicPDF } from '../utils/reportUtils';
import { formatPKR } from '../utils/financeUtils';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import { ReceiptButton } from '../components/ReceiptGenerator';
import toast from 'react-hot-toast';

const BalanceSheet = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/balance-sheet', { params: filters });
      setData(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    document.title = "Balance Sheet | Real Estate";
    fetchData();
  }, [fetchData]);

  const handleFilter = (e) => {
    e.preventDefault();
    if (!filters.from && !filters.to) {
      toast.error('Please select a date range first');
      return;
    }
    fetchData();
  };

  const handleReset = () => {
    setFilters({ from: '', to: '' });
  };

  const { openModal } = useModal();

  const totalAssets = data.filter(i => i.type.toLowerCase() === 'asset').reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalLiabilities = data.filter(i => i.type.toLowerCase() === 'liability').reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalEquity = totalAssets - totalLiabilities;

  const handleExportPDF = () => {
    const headers = ['Account Identity', 'Financial Classification', 'Audit Balance (PKR)'];
    const body = [
      ...data.map(i => [i.name.toUpperCase(), i.type.toUpperCase(), formatPKR(i.balance || 0)]),
      ['', 'TOTAL REGISTERED ASSETS', formatPKR(totalAssets)],
      ['', 'TOTAL LIABS + EQUITY', formatPKR(totalLiabilities + totalEquity)],
    ];

    generateStrategicPDF({
      title: 'Statement of Financial Position',
      subtitle: `Audit Range: ${filters.from || 'Initialization'} to ${filters.to || 'Present'} | Equilibrium: ${formatPKR(totalAssets)}`,
      headers,
      body,
      filename: `balance_sheet_audit_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-indigo-600 transition-colors">Reports</a>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Statement of Position</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Balance Sheet</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Real-Time Financial Integrity Audit</p>
        </div>
        
        <div className="flex gap-2">
          <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <Download size={16} strokeWidth={3} />
            <span>Strategic Export</span>
          </button>
        </div>
      </div>

      {/* Balance Verification Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-[-20%] right-[-5%] opacity-10 text-white transform -rotate-12">
             <ShieldCheck size={280} strokeWidth={1} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-slow">
                   <Scale size={28} strokeWidth={3} />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight">Equilibrium Status</h2>
                   <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Double-Entry Verified</span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-8 bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/5">
                <div className="text-center">
                   <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-slate-500">Total Assets</span>
                   <span className="text-lg font-black text-white font-mono">{formatPKR(totalAssets)}</span>
                </div>
                <div className="text-slate-700 font-black text-xl">=</div>
                <div className="text-center">
                   <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-slate-500">Liabs + Equity</span>
                   <span className="text-lg font-black text-indigo-400 font-mono">{formatPKR(totalLiabilities + totalEquity)}</span>
                </div>
             </div>
          </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 border-l-4 border-l-indigo-500">
         <form onSubmit={handleFilter} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full relative">
               <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">From Date</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-700"
                 value={filters.from}
                 onChange={(e) => setFilters({...filters, from: e.target.value})}
               />
            </div>
            <div className="hidden md:flex items-center pb-3 opacity-20">
               <ArrowRight size={20} strokeWidth={3} />
            </div>
            <div className="flex-1 w-full relative">
               <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">To Date</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-700"
                 value={filters.to}
                 onChange={(e) => setFilters({...filters, to: e.target.value})}
               />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <button 
                 type="submit"
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
               >
                 <Calculator size={14} strokeWidth={3} /> 
                 <span>Analyze</span>
               </button>
               <button 
                 type="button"
                 onClick={handleReset}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all"
               >
                 <RotateCcw size={14} strokeWidth={3} /> 
                 <span>Reset</span>
               </button>
            </div>
         </form>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Calculator size={20} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Ledger Composition</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Consolidated Financial Entities</span>
               </div>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <SkeletonTable rows={8} columns={4} />
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Participant</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[200px]">Classification</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-[240px]">Current Balance</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-[100px]">Audit</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {data.map((item) => {
                    let badgeClass = "bg-slate-50 text-slate-500 border-slate-200";
                    if (item.type.toLowerCase() === 'asset') badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
                    if (item.type.toLowerCase() === 'liability') badgeClass = "bg-rose-50 text-rose-600 border-rose-100";
                    if (item.type.toLowerCase() === 'equity') badgeClass = "bg-indigo-50 text-indigo-600 border-indigo-100";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="text-[14px] font-black text-slate-700 decoration-slate-200 group-hover:text-indigo-600 transition-colors group-hover:underline underline-offset-4 decoration-2">
                             {item.name}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${badgeClass}`}>
                              {item.type}
                           </span>
                        </td>
                        <td className={`px-6 py-5 text-right font-mono text-[15px] font-black ${item.balance < 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                           {formatPKR(item.balance)}
                        </td>
                        <td className="px-6 py-5 text-center">
                           <ReceiptButton txId={item.id} className="scale-90 opacity-60 hover:opacity-100 hover:scale-100 transition-all" />
                        </td>
                      </tr>
                    );
                  })}
                   {data.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12">
                         <EmptyState 
                           title="No Balance Records" 
                           description="The statement of position is currently void of any financial signatures."
                           icon={Scale}
                           action={{
                             label: "Reset Data Matrix",
                             onClick: handleReset
                           }}
                         />
                      </td>
                    </tr>
                  )}
               </tbody>
               {data.length > 0 && (
                  <tfoot className="bg-slate-900 text-white shadow-2xl relative z-10 divide-x divide-slate-800">
                     <tr>
                        <td colSpan={2} className="px-6 py-6 text-right text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">Aggregate Liquidity Position</td>
                        <td colSpan={2} className="px-6 py-6 text-right text-[20px] font-black text-emerald-400 pr-10 font-mono">
                           {formatPKR(totalAssets)}
                        </td>
                     </tr>
                  </tfoot>
               )}
            </table>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchData} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} strokeWidth={3} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchData} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ffc107' }}
        title="Transfer"
      >
        <Send size={24} strokeWidth={3} />
      </button>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl mx-auto max-w-sm">
          ITTEHAD COMMERCIAL CENTRE &copy; 2026
      </footer>
    </div>
  );
};

export default BalanceSheet;
