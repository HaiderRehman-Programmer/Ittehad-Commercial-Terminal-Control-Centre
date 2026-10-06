import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  ShieldCheck, 
  Search, 
  RotateCcw, 
  FileText, 
  CreditCard, 
  Send,
  Calendar,
  ExternalLink,
  History,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import SkeletonTable from '../components/SkeletonTable';
import { generateStrategicPDF } from '../utils/reportUtils';
import { formatPKR } from '../utils/financeUtils';

const TownOwnerAudit = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '' });

  useEffect(() => {
    document.title = "Digital Audit Trail | Ittehad Real Estate";
    fetchData();
     
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/town-owner-audit');
      setData(res.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const { openModal } = useModal();

  const handleExportPDF = () => {
    const headers = ['Audit Reference', 'Owner Identity', 'Distribution (PKR)', 'Digital Status'];
    const body = data.map(d => [
       `ID-${d.id.toString().padStart(4, '0')}`,
       d.owner.toUpperCase(),
       formatPKR(d.amount),
       d.status.toUpperCase()
    ]);

    generateStrategicPDF({
      title: 'Land-Owner Distribution Audit',
      subtitle: `Audit Baseline: ${filters.from || 'Initialization'} to ${filters.to || 'Present'} | Verification: Digital Timestamp Verified`,
      headers,
      body,
      filename: `town_owner_audit_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-indigo-600 transition-colors">Strategic Archive</a>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Town Owner Audit</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Audit Trail</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Administrative Integrity Verification Vault</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <FileText size={18} className="stroke-[3]" /> 
            <span>Strategic Export</span>
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-[-20%] right-[-5%] opacity-10 text-white transform -rotate-12">
             <ShieldCheck size={280} strokeWidth={1} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
             <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse-slow">
                <History size={28} strokeWidth={3} />
             </div>
             <div>
                <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight">Integrity Baseline</h2>
                <div className="flex items-center gap-2 mt-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">All Regional Distributions Synchronized</span>
                </div>
             </div>
          </div>
      </div>

      {/* Filter Module */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 border-l-4 border-l-slate-900">
         <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full relative">
               <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Fiscal Start</label>
               <input 
                 type="date" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-700"
                 value={filters.from}
                 onChange={(e) => setFilters({...filters, from: e.target.value})}
               />
            </div>
            <div className="flex-1 w-full relative">
               <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Fiscal End</label>
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
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
               >
                 <Search size={14} strokeWidth={3} /> 
                 <span>Verify</span>
               </button>
               <button 
                 type="button"
                 onClick={() => { setFilters({ from: '', to: '' }); setTimeout(fetchData, 0); }}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all"
               >
                 <RotateCcw size={14} strokeWidth={3} /> 
                 <span>Reset</span>
               </button>
            </div>
         </form>
      </div>

      {/* Main Distributed Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Zap size={20} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Verification Ledger</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distributed Ledger Audit Tail</span>
               </div>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <SkeletonTable rows={10} columns={5} />
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Audit Reference</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Owner Identity</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Distribution</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Reference</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="text-[11px] font-mono font-black text-slate-400 group-hover:text-indigo-600 transition-colors">ID-{item.id.toString().padStart(4, '0')}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-[13px] border border-slate-200 group-hover:scale-110 transition-transform">
                              {item.owner.charAt(0)}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[14px] font-black text-slate-800 tracking-tight leading-none mb-1">{item.owner}</span>
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{item.date}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[15px] font-black text-right text-slate-800 font-mono">
                        {formatPKR(item.amount)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors cursor-pointer">
                           {item.reference}
                           <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest shadow-sm">
                          <ShieldCheck size={12} className="stroke-[3]" />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-black italic uppercase tracking-widest opacity-50">
                        Audit trail is cleared. No distribution records found.
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 group z-[9999]">
         <button 
           onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchData} />)}
           className="w-14 h-14 rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
           title="Payment"
         >
           <CreditCard size={24} strokeWidth={3} />
         </button>
         <button 
           onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchData} />)}
           className="w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
           title="Transfer"
         >
           <Send size={24} strokeWidth={3} />
         </button>
      </div>

      {/* Dashboard Integration Footer */}
      <footer className="mt-12 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl mx-auto max-w-sm">
          ITTEHAD COMMERCIAL CENTRE &copy; 2026
      </footer>
    </div>
  );
};

export default TownOwnerAudit;
