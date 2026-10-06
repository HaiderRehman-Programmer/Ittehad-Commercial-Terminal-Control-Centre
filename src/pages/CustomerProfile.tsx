import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  Phone, 
  Building, 
  Clock, 
  FileText, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck,
  Calendar,
  Layers,
  Zap
} from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import api from '../lib/api';
import { formatPKR } from '../utils/financeUtils';

export const CustomerProfile = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/customers/${id}/360-profile`);
        setCustomer(res.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
       <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Dossier...</span>
    </div>
  );

  if (!customer) return (
    <div className="p-10 text-center">
       <div className="text-slate-300 font-black italic uppercase tracking-widest">Client Dossier Not Found</div>
    </div>
  );

  const paidPercentage = Math.round(((customer.totalInvested || 0) / (customer.totalValue || 1)) * 100);

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-screen font-sans pb-20">
      
      {/* Navigation & Breadcrumb */}
      <nav className="mb-6 text-[11px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <Link to="/customers" className="hover:text-indigo-600 transition-colors">Client Directory</Link>
        <ChevronRight size={10} className="opacity-50" />
        <span className="text-slate-400">{customer.name}</span>
      </nav>

      {/* 360 Identity Dossier Banner */}
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200 relative overflow-hidden border-l-[6px] border-l-slate-900">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/30 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
               <div className="w-28 h-28 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-slate-900/20">
                  {customer.name.charAt(0)}
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck size={20} strokeWidth={3} />
               </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">Verified Identity</span>
                  <span className="text-slate-300 font-black text-[10px] tracking-widest">ID: {id?.padStart(4, '0')}</span>
               </div>
               <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight leading-none mb-4">{customer.name}</h1>
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-2 group cursor-pointer">
                     <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Phone size={14} strokeWidth={3} className="text-indigo-500 group-hover:text-white" />
                     </div>
                     <span className="text-[13px] font-bold text-slate-600">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-pointer">
                     <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <CreditCard size={14} strokeWidth={3} className="text-indigo-500 group-hover:text-white" />
                     </div>
                     <span className="text-[13px] font-bold text-slate-600">CNIC: {customer.cnic || 'NOT RECORDED'}</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-pointer">
                     <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <MapPin size={14} strokeWidth={3} className="text-indigo-500 group-hover:text-white" />
                     </div>
                     <span className="text-[13px] font-bold text-slate-600 max-w-[200px] truncate">{customer.address || 'PRIMARY ADDRESS NOT SET'}</span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col gap-3">
               <Link 
                 to={`/ledger/customer/${id}`}
                 className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-800 text-white px-8 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
               >
                 <Layers size={18} strokeWidth={3} />
                 <span>Account Statement</span>
               </Link>
               <button className="flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-800 px-8 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                 <Zap size={18} strokeWidth={3} className="text-indigo-600" />
                 <span>Action Hub</span>
               </button>
            </div>
         </div>
      </div>

      {/* Intelligence Pulse Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
         <KPICard title="Land Assets" value={customer.totalProperties || 0} icon={Building} iconColor="text-indigo-600" iconBg="bg-white" />
         <KPICard title="Total Portfolio" value={formatPKR(customer.totalValue || 0)} icon={FileText} iconColor="text-slate-800" iconBg="bg-white" />
         <KPICard title="Capital Injected" value={formatPKR(customer.totalInvested || 0)} icon={TrendingUp} iconColor="text-emerald-500" iconBg="bg-white" />
         <KPICard title="Liability Gap" value={formatPKR(customer.pendingDues || 0)} icon={Clock} iconColor="text-rose-500" iconBg="bg-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Portfolio Summary */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                        <Building size={20} strokeWidth={3} />
                     </div>
                     <div>
                        <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Portfolio Summary</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Asset Integrity Check</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Assets:</span>
                     <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">{customer.totalProperties || 0} Units</span>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <th className="px-6 py-4">Asset Identification</th>
                           <th className="px-6 py-4">Location Matrix</th>
                           <th className="px-6 py-4 text-right">Value (PKR)</th>
                           <th className="px-6 py-4 text-center">Health</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {customer.properties?.map((prop: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                               <div className="flex flex-col">
                                  <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">Unit {prop.unit_id}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{prop.type || 'Standard Plot'}</span>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-2 text-[11px] font-black text-slate-500">
                                  <MapPin size={12} className="text-slate-300" strokeWidth={3} />
                                  {prop.town_name || 'CENTRAL COMPLEX'}
                               </div>
                            </td>
                            <td className="px-6 py-5 text-right font-mono text-[13px] font-black text-slate-700">
                               {formatPKR(prop.price)}
                            </td>
                            <td className="px-6 py-5 text-center">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm`}>
                                 {prop.status || 'Verified'}
                               </span>
                            </td>
                          </tr>
                        ))}
                        {(!customer.properties || customer.properties.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-6 py-16 text-center text-slate-300 font-black italic uppercase tracking-widest opacity-50">
                               No active asset holdings documented in this dossier.
                            </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Account Health & Progress */}
         <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                     <ShieldCheck size={20} strokeWidth={3} />
                  </div>
                  <div>
                     <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Portfolio Health</h3>
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Injected Liquidity Analysis</span>
                  </div>
               </div>
               
               <div className="flex flex-col items-center mb-8">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.92} strokeDashoffset={552.92 - (552.92 * paidPercentage) / 100} className="text-emerald-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800 tracking-tighter">{paidPercentage}%</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Equity</span>
                     </div>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Valuation</span>
                     </div>
                     <span className="text-[13px] font-black text-slate-800 font-mono">{formatPKR(customer.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Paid Principal</span>
                     </div>
                     <span className="text-[13px] font-black text-emerald-600 font-mono">{formatPKR(customer.totalInvested || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Outstanding GAP</span>
                     </div>
                     <span className="text-[13px] font-black text-rose-600 font-mono">{formatPKR(customer.pendingDues || 0)}</span>
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
                   <Calendar size={120} strokeWidth={1} />
                </div>
                <h4 className="text-[12px] font-black text-indigo-400 uppercase tracking-widest mb-2 relative z-10">Client Anniversary</h4>
                <p className="text-xl font-black text-white leading-tight uppercase relative z-10">{customer.joinDate || 'AUGUST 12, 2026'}</p>
                <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between relative z-10">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loyalty Tier</span>
                      <span className="text-indigo-300 font-black text-[12px] uppercase">Elite Strategic Partner</span>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700">
                      <TrendingUp size={20} strokeWidth={3} />
                   </div>
                </div>
            </div>
         </div>
      </div>

      <footer className="mt-12 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl mx-auto max-w-sm">
          ITTEHAD COMMERCIAL CENTRE &copy; 2026
      </footer>
    </div>
  );
};

export default CustomerProfile;
