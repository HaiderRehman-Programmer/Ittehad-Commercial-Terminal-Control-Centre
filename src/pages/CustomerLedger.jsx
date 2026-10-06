import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar,
  Layers,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';
import { ReceiptButton } from '../components/ReceiptGenerator';
import SkeletonTable from '../components/SkeletonTable';
import { generateStrategicPDF } from '../utils/reportUtils';
import { formatPKR } from '../utils/financeUtils';

const CustomerLedger = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    document.title = `Customer Ledger | ${customer?.name || ''}`;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, ledgerRes] = await Promise.all([
        api.get(`/customers?id=${id}`),
        api.get(`/ledger/customer/${id}`)
      ]);
      
      const custData = custRes.data?.data || (Array.isArray(custRes.data) ? custRes.data : []);
      const foundCust = Array.isArray(custData) ? custData.find((c) => c.id == id) : custRes.data;
      setCustomer(foundCust);
      
      const ledgerData = ledgerRes.data?.data || (Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
      setLedger(ledgerData);
    } catch (err) {
      console.error('Error fetching ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!customer || ledger.length === 0) return;
    
    const headers = ['SLOT (DATE)', 'FORENSIC DESCRIPTION', 'ACCOUNT ENTITY', 'DEBIT (PAID)', 'CREDIT (REC)', 'RUNNING BALANCE'];
    const body = ledger.map(r => [
      r.date, 
      r.description.toUpperCase(), 
      r.account_name.toUpperCase(), 
      r.debit > 0 ? formatPKR(r.debit) : '-', 
      r.credit > 0 ? formatPKR(r.credit) : '-', 
      formatPKR(r.runningBalance)
    ]);

    generateStrategicPDF({
      title: 'Customer Account Statement',
      subtitle: `Protocol: ${customer.name.toUpperCase()} | Identity: ID-${id?.padStart(4, '0')} | Generation: Digital Audit Baseline`,
      headers,
      body,
      filename: `ledger_statement_${customer.name.replace(/\s+/g, '_')}.pdf`,
      orientation: 'landscape'
    });
  };

  const handleReset = () => {
    setDateRange({ from: '', to: '' });
    fetchData();
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex justify-between items-center mb-6">
           <nav className="text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
              <Link to="/customers" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                 <ArrowLeft size={14} strokeWidth={3} /> Client Directory
              </Link>
              <ChevronRight size={10} className="opacity-50" />
              <small className="text-slate-400">Transaction Pulse</small>
           </nav>
           
           <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
           >
              <FileText size={16} strokeWidth={3} />
              <span>Strategic Export</span>
           </button>
        </div>

        {/* Profile Identity Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden border-l-[6px] border-l-indigo-600">
          <div className="absolute top-[-10%] right-[-5%] opacity-[0.03] transform rotate-12 pointer-events-none">
             <Fingerprint size={280} strokeWidth={1} />
          </div>
          
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/10 border border-slate-800">
               {loading ? (
                 <div className="w-12 h-12 bg-slate-800 rounded-lg animate-pulse" />
               ) : (
                 <User size={40} strokeWidth={2.5} />
               )}
            </div>
            <div className="flex-1">
               {loading ? (
                 <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-32 bg-slate-50 rounded animate-pulse" />
                 </div>
               ) : (
                 <>
                   <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase mb-2">{customer?.name}</h1>
                   <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                         <CreditCard size={14} className="text-indigo-400" /> ID-{id?.padStart(4, '0')}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">
                         <Layers size={14} className="text-emerald-500" /> {customer?.phone || 'ANONYMOUS CLIENT'}
                      </span>
                   </div>
                 </>
               )}
            </div>
          </div>

          {!loading && customer && (
            <div className="flex gap-10 md:border-l md:border-slate-100 md:pl-10 relative z-10">
               <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Lifecycle Billing</span>
                  <div className="text-2xl font-black text-slate-800 tracking-tighter">{formatPKR(customer.total_amount || 0)}</div>
               </div>
               <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Liability GAP</span>
                  <div className={`text-2xl font-black tracking-tighter ${customer.remaining === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {formatPKR(customer.remaining || 0)}
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Forensic Filter Matrix */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-end gap-6 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
           <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Historical Start</label>
              <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10" />
           </div>
           <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Historical Termination</label>
              <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10" />
           </div>
           <div className="flex gap-2">
              <button 
                onClick={fetchData}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
              >
                <Filter size={16} strokeWidth={3} />
                <span>Verify</span>
              </button>
              <button 
                onClick={handleReset}
                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <RotateCcw size={18} strokeWidth={3} />
              </button>
           </div>
        </div>

        {/* Ledger Verification Grid */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                   <TrendingUp size={20} strokeWidth={3} />
                </div>
                <div>
                   <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight leading-none">Integrity Timeline</h2>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Verified Distributed Transactional Records</span>
                </div>
             </div>
             
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Archive Synchronized</span>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <SkeletonTable rows={10} columns={7} />
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Slot (Date)</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Forensic Description</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Entity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Debit ($-)</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Credit ($+)</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Running Baseline</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ledger.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2 text-[12px] font-black text-slate-600 font-mono">
                            <Calendar size={13} className="text-indigo-400" strokeWidth={3} />
                            {row.date}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="max-w-[300px]">
                            <div className="text-[13px] font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{row.description}</div>
                            <div className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1 italic">{row.category || 'System General Entry'}</div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-[0.2em] shadow-sm">
                           {row.account_name}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono">
                         <span className={`text-[14px] font-black ${row.debit > 0 ? 'text-rose-500' : 'text-slate-200'}`}>
                           {row.debit > 0 ? formatPKR(row.debit) : '---'}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono">
                         <span className={`text-[14px] font-black ${row.credit > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                           {row.credit > 0 ? formatPKR(row.credit) : '---'}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono">
                         <div className={`text-[15px] font-black px-4 py-1.5 rounded-xl inline-block ${row.runningBalance < 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'}`}>
                           {formatPKR(row.runningBalance)}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <ReceiptButton txId={row.id} className="scale-90 hover:scale-110 active:scale-95 transition-all opacity-40 group-hover:opacity-100" />
                      </td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-24 text-center text-slate-300 font-black italic uppercase tracking-[0.3em] opacity-40">
                         No immutable transactional records documented for this identity.
                      </td>
                    </tr>
                  )}
                </tbody>
                {ledger.length > 0 && (
                   <tfoot className="bg-slate-900 text-white shadow-2xl relative z-10 divide-x divide-slate-800 border-t border-slate-800">
                      <tr>
                        <td colSpan={5} className="px-6 py-7 text-right text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Net Outstanding Liquidity Gap</td>
                        <td colSpan={2} className={`px-6 py-7 text-right text-[22px] font-black pr-10 font-mono italic ${ledger[ledger.length - 1].runningBalance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {formatPKR(ledger[ledger.length - 1].runningBalance)}
                        </td>
                      </tr>
                   </tfoot>
                )}
              </table>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl max-w-sm mx-auto">
            ITTEHAD COMMERCIAL CENTRE &copy; 2026
        </footer>
      </div>
    </div>
  );
};

export default CustomerLedger;
