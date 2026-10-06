import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Search, 
  User, 
  Phone,
  CreditCard as CreditCardIcon,
  Send,
  Eye,
  Edit2,
  ChevronRight,
  Filter,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { useModal } from '../components/Modal';
import { useNavigate, Link } from 'react-router-dom';
import PaymentForm from '../components/forms/PaymentForm';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';

const Customers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    document.title = "Client Directory | Ittehad Real Estate";
    const controller = new AbortController();
    fetchData(1, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchData = async (page = 1, signal) => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?page=${page}&search=${searchTerm}`, { signal });
      if (!signal?.aborted) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(err);
        setData([]);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const { openModal } = useModal();
  const navigate = useNavigate();

  const handleProfileClick = (id) => {
    navigate(`/customer-profile/${id}`);
  };

  const handleReset = () => {
    setSearchTerm('');
    fetchData(1, null);
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Strategic Dashboard</Link>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Client Directory</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Client Directory</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Consolidated Relationship Management Archive</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} strokeWidth={3} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 w-64 transition-all" 
              />
           </div>
           <button onClick={handleReset} className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
              <RotateCcw size={18} strokeWidth={3} />
           </button>
        </div>
      </div>

      {/* Filter Intelligence Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex items-center justify-between overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
         <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
               <Filter size={18} strokeWidth={3} />
            </div>
            <div>
               <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight leading-none">Archival Ledger</h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Verified Distributed Identity Database</span>
            </div>
         </div>
         <div className="flex items-center gap-3 relative z-10">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Connectivity Established</span>
         </div>
      </div>

      {/* Main Client Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <SkeletonTable rows={10} columns={7} />
        ) : (
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Client Identity (360)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Relation Baseline</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Identity (CNIC)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Communications</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Cast/Group</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Digital Reference</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Forensics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleProfileClick(item.id)}>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xl group-hover:scale-110 transition-transform duration-300 relative bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg">
                       <img 
                         src={`https://i.pravatar.cc/150?u=ittehad_cust_${item.id}`} 
                         alt={item.name} 
                         className="w-full h-full object-cover"
                         onError={(e) => { e.target.style.display = 'none'; }}
                       />
                       <User size={24} strokeWidth={2.5} />
                       <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[15px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-none mb-1 uppercase tracking-tight">{item.name}</span>
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">CUST-ID-{item.id.toString().padStart(4, '0')}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-[13px] font-bold text-slate-500 uppercase tracking-tighter">
                    {item.relation_name || '-'}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-2 font-mono text-[12px] font-black text-slate-700 bg-slate-50 py-1 px-3 rounded-lg border border-slate-100">
                     {item.cnic || 'NO CNIC'}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="text-[13px] font-black text-indigo-600 flex items-center justify-center gap-2">
                    <Phone size={14} strokeWidth={3} className="opacity-30"/>
                    {item.phone || 'NO CONTACT'}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic border border-slate-100 px-2.5 py-1 rounded-lg">
                    {item.cast || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[11px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-block truncate max-w-[130px] uppercase tracking-widest shadow-sm" title={item.reference}>
                    {item.reference || 'Archival Reference'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-2">
                     <button 
                        onClick={() => handleProfileClick(item.id)}
                        className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                        title="View Dossier"
                     >
                       <Eye size={16} strokeWidth={3} />
                     </button>
                     <button 
                        className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-inner active:scale-95 border border-indigo-100"
                        title="Protocol Edit"
                     >
                       <Edit2 size={16} strokeWidth={3} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-12">
                   <EmptyState 
                     title="No Client Signatures" 
                     description="The archival ledger is currently void of signatures matching your active search string."
                     icon={User}
                     action={{
                       label: "Reset Search",
                       onClick: handleReset
                     }}
                   />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
        
        <div className="flex justify-between items-center px-8 py-6 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Audited Result Set: {data.length} of {pagination.total} Verified Signatures
          </div>
          <div className="flex gap-2">
             <button 
                disabled={pagination.page <= 1}
                onClick={() => fetchData(pagination.page - 1, null)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
             >
                Archival Prev
             </button>
             <div className="flex gap-2">
                {[...Array(pagination.pages || 0)].map((_, i) => (
                   <button 
                      key={i}
                      onClick={() => fetchData(i + 1, null)}
                      className={`w-10 h-10 text-[11px] font-black rounded-xl border transition-all active:scale-95 ${pagination.page === i + 1 ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300'}`}
                   >
                      {i + 1}
                   </button>
                ))}
             </div>
             <button 
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchData(pagination.page + 1, null)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm active:scale-95"
             >
                Archival Next
             </button>
          </div>
        </div>
      </div>

      {/* Floating Action Intelligence */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 group z-[9999]">
         <button 
           onClick={() => openModal('Record Transaction', <PaymentForm onRefresh={() => fetchData(pagination.page, null)} />)}
           className="w-14 h-14 rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
           title="Identity Transaction"
         >
           <CreditCardIcon size={24} strokeWidth={3} />
         </button>
         <button 
           className="w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
           title="Protocol Verification"
         >
           <ShieldCheck size={24} strokeWidth={3} />
         </button>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl mx-auto max-w-sm">
          ITTEHAD COMMERCIAL CENTRE &copy; 2026
      </footer>
    </div>
  );
};

export default Customers;
