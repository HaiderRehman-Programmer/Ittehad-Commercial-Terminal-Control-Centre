import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { 
  FileText, 
  Filter, 
  RotateCcw,
  CreditCard,
  Send,
  TrendingUp,
  TrendingDown,
  Scale,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
import { generateStrategicPDF } from '../utils/reportUtils';
import { formatPKR } from '../utils/financeUtils';

const IncomeStatement = () => {
  const [data, setData] = useState({ income: 0, expense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '' });

  useEffect(() => {
    document.title = "Income Statement | Real Estate";
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/income-statement', { params: filters });
      
      const summary = { income: 0, expense: 0, netProfit: 0 };
      const rows = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      rows.forEach(row => {
        if (row.type === 'income') summary.income += (row.revenue || 0);
        if (row.type === 'expense') summary.expense += (row.expense || 0);
      });
      summary.netProfit = summary.income - summary.expense;
      
      setData(summary);
    } catch (err) {
      console.error(err);
      setData({ income: 0, expense: 0, netProfit: 0 });
    } finally {
      setLoading(false);
    }
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

  const { openModal } = useModal();

  const handleExportPDF = () => {
    const headers = ['Financial Particulars', 'Audit Assessment (PKR)'];
    const body = [
      ['Total Income / Revenue', formatPKR(data.income)],
      ['Total Operating Expenses', formatPKR(data.expense)],
      ['Net Profit / (Loss)', formatPKR(data.netProfit)]
    ];

    generateStrategicPDF({
      title: 'Income Statement Audit',
      subtitle: `Period: ${filters.from || 'Initialization'} to ${filters.to || 'Present'} | Net Bottom Line: ${formatPKR(data.netProfit)}`,
      headers,
      body,
      filename: `income_statement_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Reports</a>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Income Statement</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Income Statement</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Operational Performance Archive</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <FileText size={16} strokeWidth={3} /> 
            <span>Strategic Export</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 border-l-4 border-l-blue-500">
         <form onSubmit={handleFilter} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full relative">
               <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">From Date</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700"
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
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold text-slate-700"
                 value={filters.to}
                 onChange={(e) => setFilters({...filters, to: e.target.value})}
               />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <button 
                 type="submit"
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
               >
                 <Filter size={14} strokeWidth={3} /> 
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

      {/* Summary Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl mx-auto border-t-4 border-t-slate-800">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex align-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-md">
              <Scale size={18} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tighter">Gross Profit Assessment</h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Integrated Ledger</span>
            </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {loading ? (
             <div className="p-10 space-y-4">
                <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
             </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100 group-hover:scale-110 transition-transform">
                    <TrendingUp size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="text-[15px] font-black text-slate-900 uppercase tracking-tight">Total Revenue</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operating Receipts</div>
                  </div>
                </div>
                <div className="text-xl font-black text-slate-900 font-mono">
                  {formatPKR(data.income)}
                </div>
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
                    <TrendingDown size={24} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="text-[15px] font-black text-slate-900 uppercase tracking-tight">Total Expenses</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Operating Overheads</div>
                  </div>
                </div>
                <div className="text-xl font-black text-slate-900 font-mono text-rose-500">
                  {formatPKR(data.expense)}
                </div>
              </div>

              <div className="flex items-center justify-between p-8 bg-slate-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-white transform rotate-12">
                   <Scale size={80} strokeWidth={1} />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <Scale size={28} strokeWidth={3} />
                  </div>
                  <div>
                    <div className="text-[18px] font-black text-white uppercase tracking-tight leading-none">Net Bottom Line</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 underline decoration-blue-500 decoration-2 underline-offset-4">Verified Net Profit</div>
                  </div>
                </div>
                <div className="text-3xl font-black text-[#60efff] tracking-tighter relative z-10 font-mono">
                  {formatPKR(data.netProfit)}
                </div>
              </div>
              {data.income === 0 && data.expense === 0 && (
                <div className="p-12 text-center">
                   <EmptyState 
                     title="No Operational Signal" 
                     description="The financial archival ledger is currently silent for the specified temporal range."
                     icon={Scale}
                     action={{
                       label: "Reset Temporal Range",
                       onClick: handleReset
                     }}
                   />
                </div>
              )}
            </>
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

export default IncomeStatement;
