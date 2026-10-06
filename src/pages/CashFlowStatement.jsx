import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  RotateCcw,
  Search,
  ChevronRight,
  Zap,
  CreditCard,
  Send,
  Calendar
} from 'lucide-react';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import { generateStrategicPDF } from '../utils/reportUtils';
import { formatPKR } from '../utils/financeUtils';
import SkeletonTable from '../components/SkeletonTable';
import toast from 'react-hot-toast';

const CashFlowStatement = () => {
  const [data, setData] = useState({ inflow: 0, outflow: 0, netCash: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '' });

  useEffect(() => {
    document.title = "Cash Flow Statement | Real Estate";
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/cashflow-statement', { params: filters });
      
      const summary = { inflow: 0, outflow: 0, netCash: 0 };
      const rows = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      rows.forEach(row => {
        if (row.type === 'inflow') summary.inflow += (row.amount || 0);
        if (row.type === 'outflow') summary.outflow += (row.amount || 0);
      });
      summary.netCash = summary.inflow - summary.outflow;
      
      setData(summary);
    } catch (err) {
      console.error(err);
      setData({ inflow: 0, outflow: 0, netCash: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    if (!filters.from && !filters.to) {
        toast.error('Please select a date range');
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
    const headers = ['Liquidity Classification', 'Audit Amount (PKR)'];
    const body = [
      ['Total Cash Inflow (Receipts)', formatPKR(data.inflow)],
      ['Total Cash Outflow (Payments)', formatPKR(data.outflow)],
      ['Net Liquidity Position', formatPKR(data.netCash)]
    ];

    generateStrategicPDF({
      title: 'Cash Flow Audit',
      subtitle: `Period: ${filters.from || 'Initialization'} to ${filters.to || 'Present'} | Available Reserve: ${formatPKR(data.netCash)}`,
      headers,
      body,
      filename: `cash_flow_audit_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-indigo-600 transition-colors">Reports</a>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Cash Liquidity Statement</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Cash Flow</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Real-Time Movement Audit Archive</p>
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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-10 border-l-4 border-l-indigo-500">
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
            <div className="hidden md:flex items-center pb-3 opacity-20 text-indigo-500">
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
                 <span>Filter</span>
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

      {/* Main Cash Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Total Inflow */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm border-t-4 border-t-emerald-500 relative group">
           <div className="absolute top-[-10%] right-[-5%] opacity-5 text-emerald-500 transform rotate-12 pointer-events-none">
              <TrendingUp size={140} strokeWidth={1}/>
           </div>
           
           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex align-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                 <TrendingUp size={20} strokeWidth={3} />
              </div>
              <div>
                 <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Total Liquidity Inflow</h3>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Receipts</span>
              </div>
           </div>
           
           <div className="p-10 text-center relative z-10">
              {loading ? (
                <div className="h-10 w-48 bg-slate-50 rounded-xl animate-pulse mx-auto" />
              ) : (
                <>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Total System Debits</div>
                  <div className="text-4xl font-black text-slate-800 tracking-tighter">{formatPKR(data.inflow)}</div>
                </>
              )}
           </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm border-t-4 border-t-rose-500 relative group">
           <div className="absolute top-[-10%] right-[-5%] opacity-5 text-rose-500 transform rotate-12 pointer-events-none">
              <TrendingDown size={140} strokeWidth={1}/>
           </div>
           
           <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex align-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                 <TrendingDown size={20} strokeWidth={3} />
              </div>
              <div>
                 <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Total Liquidity Outflow</h3>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified Payments</span>
              </div>
           </div>
           
           <div className="p-10 text-center relative z-10">
              {loading ? (
                <div className="h-10 w-48 bg-slate-50 rounded-xl animate-pulse mx-auto" />
              ) : (
                <>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Total System Credits</div>
                  <div className="text-4xl font-black text-slate-800 tracking-tighter text-rose-500">{formatPKR(data.outflow)}</div>
                </>
              )}
           </div>
        </div>

        {/* Net Cash Position */}
        <div className="bg-slate-900 rounded-2xl shadow-2xl relative overflow-hidden group border border-slate-800 border-t-4 border-t-indigo-500">
           <div className="absolute top-[-10%] right-[-5%] opacity-10 text-indigo-500 transform rotate-45 pointer-events-none">
              <Zap size={180} strokeWidth={1}/>
           </div>
           
           <div className="p-6 border-b border-slate-800 bg-black/20 flex align-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                 <Zap size={20} strokeWidth={3} />
              </div>
              <div>
                 <h3 className="text-[13px] font-black text-white uppercase tracking-tight">Net Operational Cash</h3>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Liquidity Delta</span>
              </div>
           </div>
           
           <div className="p-10 text-center relative z-10">
              {loading ? (
                <div className="h-10 w-48 bg-slate-800 rounded-xl animate-pulse mx-auto" />
              ) : (
                <>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Net Cash Availability</div>
                  <div className="text-4xl font-black text-[#60efff] tracking-tighter">{formatPKR(data.netCash)}</div>
                </>
              )}
           </div>
        </div>
      </div>

      {/* Audit List Section (Visual Placeholder) */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Calendar size={20} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Transaction Movement Log</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Chronological Cash Audit Trail</span>
               </div>
            </div>
         </div>
         <div className="p-20 text-center text-slate-300 font-black italic uppercase tracking-[0.4em] opacity-40">
            Cash Flow Visualization Suite 2026
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

export default CashFlowStatement;
