import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { 
  FileText, 
  Calendar, 
  Search, 
  RotateCcw,
  CreditCard,
  Send,
  PieChart,
  ArrowRight,
  Calculator,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { generateStrategicPDF } from '../utils/reportUtils';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import { ReceiptButton } from '../components/ReceiptGenerator';
import toast from 'react-hot-toast';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';

const TrialBalance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });

  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    try {
      const res = await api.get('/reports/trial-balance', { params: filters, signal });
      if (!signal?.aborted) setData(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(err);
        setData([]);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    document.title = "Trial Balance | Real Estate";
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const { openModal } = useModal();

  const exportToPDF = () => {
    if (data.length === 0) return;
    
    const headers = ['Account ID', 'Account Name', 'Account Type', 'Debit', 'Credit'];
    const body = [
      ...data.map(t => [
        t.id.toString().padStart(4, '0'), 
        t.name.toUpperCase(), 
        t.type.toUpperCase(), 
        `Rs. ${t.debit.toLocaleString()}`, 
        `Rs. ${t.credit.toLocaleString()}`
      ]),
      ['', '', 'TOTAL AUDIT', `Rs. ${totalDebit.toLocaleString()}`, `Rs. ${totalCredit.toLocaleString()}`]
    ];

    generateStrategicPDF({
      title: 'Trial Balance Audit',
      subtitle: `Period: ${filters.from || 'All Time'} to ${filters.to || 'Present'} | Verification: ${Math.abs(totalDebit - totalCredit) < 1 ? 'PASS' : 'FAIL'}`,
      headers,
      body,
      filename: `trial_balance_audit_${new Date().getTime()}.pdf`
    });
  };

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
      setTimeout(fetchData, 0);
  };

  const totalDebit = data.reduce((acc, curr) => acc + (curr.debit || 0), 0);
  const totalCredit = data.reduce((acc, curr) => acc + (curr.credit || 0), 0);

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-indigo-600 transition-colors">Reports</a>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Trial Balance Audit</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Trial Balance</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Consolidated Ledger Consistency Audit</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <FileText size={16} strokeWidth={3} /> 
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-[-20%] right-[-5%] opacity-10 text-white transform -rotate-12">
             <ShieldCheck size={280} strokeWidth={1} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse-slow">
                   <Calculator size={28} strokeWidth={3} />
                </div>
                <div>
                   <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight">Arithmetic Parity</h2>
                   <div className="flex items-center gap-2 mt-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${Math.abs(totalDebit - totalCredit) < 1 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-ping'}`} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {Math.abs(totalDebit - totalCredit) < 1 ? 'Debit/Credit Equality Verified' : 'Imbalance Detected in Ledger'}
                      </span>
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-8 bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/5">
                <div className="text-center">
                   <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Debits</span>
                   <span className="text-lg font-black text-emerald-400 font-mono">Rs. {totalDebit.toLocaleString()}</span>
                </div>
                <div className="text-slate-700 font-black text-xl">|</div>
                <div className="text-center">
                   <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Credits</span>
                   <span className="text-lg font-black text-rose-400 font-mono">Rs. {totalCredit.toLocaleString()}</span>
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
                 <Search size={14} strokeWidth={3} /> 
                 <span>Generate</span>
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

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Zap size={20} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Statement Ledgers</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Consolidated Multi-Asset Audit</span>
               </div>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <SkeletonTable rows={10} columns={6} />
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Portfolio</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[160px]">Classification</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-[200px]">Debit (Paid)</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-[200px]">Credit (Received)</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-[100px]">Audit</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {data.map((item) => {
                    let badgeClass = "bg-slate-50 text-slate-500 border-slate-200";
                    if (item.type?.toLowerCase() === 'asset') badgeClass = "bg-blue-50 text-blue-600 border-blue-100";
                    if (item.type?.toLowerCase() === 'income') badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-100";
                    if (item.type?.toLowerCase() === 'expense') badgeClass = "bg-rose-50 text-rose-600 border-rose-100";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                             <span className="text-[14px] font-black text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">ID: {item.id.toString().padStart(4, '0')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${badgeClass}`}>
                              {item.type}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-[14px] font-black text-slate-700">
                           {item.debit > 0 ? `Rs. ${item.debit.toLocaleString()}` : <span className="opacity-10">Rs. 0.00</span>}
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-[14px] font-black text-slate-700">
                           {item.credit > 0 ? `Rs. ${item.credit.toLocaleString()}` : <span className="opacity-10">Rs. 0.00</span>}
                        </td>
                        <td className="px-6 py-5 text-center">
                           <ReceiptButton txId={item.id} className="scale-90 opacity-60 hover:opacity-100 hover:scale-100 transition-all" />
                        </td>
                      </tr>
                    );
                  })}
                   {data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12">
                         <EmptyState 
                           title="No Ledger Records" 
                           description="The trial balance matrix is currently void of any financial signatures for the active period."
                           icon={Calculator}
                           action={{
                             label: "Reset Period",
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
                        <td colSpan={2} className="px-6 py-6 text-right text-[12px] font-black uppercase tracking-[0.2em] text-slate-500">Aggregate Audit Position</td>
                        <td className="px-6 py-6 text-right text-[18px] font-black text-emerald-400 font-mono">
                           Rs. {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td colSpan={2} className="px-6 py-6 text-right text-[18px] font-black text-rose-400 font-mono pr-10">
                           Rs. {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={() => fetchData()} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} strokeWidth={3} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={() => fetchData()} />)}
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

export default TrialBalance;
