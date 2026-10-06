import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  MapPin, 
  Layers, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  Activity,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import api from '../../lib/api';
import { formatPKR } from '../../utils/financeUtils';

const PropertyDossier = ({ plot }) => {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  const fetchDossier = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/plots/${plot.id}/dossier`);
      setDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch dossier:', err);
    } finally {
      setLoading(false);
    }
  }, [plot.id]);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);


  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Assembling Dossier...</span>
    </div>
  );

  const { dossier } = details || {};

  return (
    <div className="max-w-2xl mx-auto font-sans">
      {/* Header Strategy */}
      <div className="bg-slate-900 rounded-[2rem] p-8 mb-8 relative overflow-hidden text-white border border-slate-800 shadow-2xl">
        <div className="absolute right-[-5%] top-[-10%] opacity-10 rotate-12">
           <Layers size={240} strokeWidth={1} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md ${
              plot.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
              plot.status === 'sold' ? 'bg-rose-500/20 text-rose-400' :
              'bg-indigo-500/20 text-indigo-400'
            }`}>
              {plot.status}
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{details?.town?.name || 'Phased Development'}</span>
          </div>
          
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">{plot.name}</h2>
          <div className="flex items-center gap-6 text-[12px] font-bold text-slate-400">
             <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-400" />
                <span>{plot.marla} / {plot.dimensions}</span>
             </div>
             <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" />
                <span>Value: {formatPKR(plot.price)}</span>
             </div>
          </div>
        </div>
      </div>

      {!dossier ? (
        <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-[2rem] p-12 text-center">
           <ShieldCheck size={48} className="text-emerald-500 mx-auto mb-4" />
           <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight mb-2">Available for Conversion</h3>
           <p className="text-emerald-600 text-sm font-medium mb-6">This property is currently unencumbered. You can issue a token or secure a booking immediately.</p>
           <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Secure Booking</button>
              <button className="px-6 py-3 bg-white text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">Issue Token</button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Customer Intelligence */}
           <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <User size={24} strokeWidth={3} />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Allottee</h3>
                    <div className="text-[17px] font-black text-slate-900 uppercase tracking-tight">{dossier.customer?.name}</div>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</span>
                    <span className="text-[12px] font-bold text-slate-700">{dossier.customer?.phone}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNIC No.</span>
                    <span className="text-[12px] font-bold text-slate-700">{dossier.customer?.cnic || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Rep</span>
                    <span className="text-[12px] font-black text-indigo-600 uppercase italic">{dossier.agent?.name || 'Direct Sale'}</span>
                 </div>
              </div>
           </div>

           {/* Recovery Intelligence */}
           <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 shadow-inner">
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recovery Velocity</h3>
                    <div className="text-[24px] font-black text-slate-900 tracking-tighter">{dossier.recoveryProgress.toFixed(1)}%</div>
                 </div>
                 <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 flex items-center justify-center text-[11px] font-black text-indigo-700">
                    {Math.round(dossier.recoveryProgress)}%
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Liquidated</div>
                    <div className="text-[15px] font-black text-emerald-600 leading-none">{formatPKR(dossier.totalPaid)}</div>
                 </div>
                 <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Outstanding Balance</div>
                    <div className="text-[15px] font-black text-rose-600 leading-none">{formatPKR(dossier.totalDue - dossier.totalPaid)}</div>
                 </div>
              </div>
           </div>

           {/* Next Action Intelligence */}
           <div className="md:col-span-2 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[80px]" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-xl shrink-0 shadow-inner">
                       <Clock size={32} strokeWidth={2.5} className="text-amber-400" />
                    </div>
                    <div>
                       <h3 className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Next Expected Recovery</h3>
                       {dossier.nextInstallment ? (
                         <div className="flex flex-col">
                            <span className="text-[20px] font-black tracking-tight leading-tight">{formatPKR(dossier.nextInstallment.amount)}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Due on {dossier.nextInstallment.due_date}</span>
                         </div>
                       ) : (
                         <span className="text-[16px] font-black text-emerald-400 uppercase italic">Installment Schedule Cleared</span>
                       )}
                    </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white text-slate-900 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl">
                       <TrendingUp size={16} strokeWidth={3} />
                       Fiscal Report
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                       <FileText size={16} strokeWidth={3} />
                       View Detail
                    </button>
                 </div>
              </div>

              {/* Recovery Bar Forensic */}
              <div className="mt-8 bg-white/10 h-3 rounded-full overflow-hidden border border-white/5 p-[1px]">
                 <div 
                   className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]" 
                   style={{ width: `${dossier.recoveryProgress}%` }}
                 />
              </div>
           </div>
        </div>
      )}

      {/* Forensic Intelligence Seal */}
      <div className="mt-8 py-6 border-t border-slate-100 flex items-center justify-center gap-3 opacity-60">
         <ShieldCheck size={18} className="text-slate-400" />
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Verified Property Intelligence</span>
      </div>
    </div>
  );
};

export default PropertyDossier;
