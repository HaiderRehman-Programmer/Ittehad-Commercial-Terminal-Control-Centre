import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Share2, 
  Edit2, 
  Trash2,
  User,
  Users,
  CreditCard,
  Send,
  MapPin,
  Phone
} from 'lucide-react';
import { useModal } from '../components/Modal';
import SkeletonTable from '../components/SkeletonTable';

const TownOwners = () => {
  const [owners, setOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Town Owners | Real Estate";
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await api.get('/town-owners');
      setOwners(res.data);
    } catch (err) {
      console.error(err);
      setOwners([]);
    } finally {
      setLoading(false);
    }
  };

  const { openModal } = useModal();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this town owner?')) {
      try {
        await api.delete(`/town-owners/${id}`);
        setOwners(prev => prev.filter(o => o.id !== id));
        toast.success('Town owner deleted successfully');
      } catch (err) {
        console.error(err);
        // Error is handled by global interceptor
      }
    }
  };

  const filteredOwners = owners.filter(o => 
    o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOwners = filteredOwners.length;
  const aggregateKanal = filteredOwners.reduce((sum, o) => sum + ((o.acre * 8) + o.kanal + (o.marla / 20)), 0);

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-indigo-600 transition-colors tracking-widest">Land Management</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Town Owners</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Primary Acquisition Directory
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse-slow" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Ownership Hub</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Principal Investor & Acquisition Audit</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            disabled
            className="flex items-center gap-2 bg-slate-200 text-slate-400 px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest cursor-not-allowed opacity-50 border border-slate-300 shadow-inner"
            title="Module in development"
          >
            <Share2 size={16} strokeWidth={3} /> 
            <span>Stake Transfer</span>
          </button>
          <button 
            onClick={() => openModal('Add Town Owner', <TownOwnerForm onRefresh={fetchOwners} />)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> 
            <span>Add Principal</span>
          </button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700" />
            <div className="flex items-center gap-5 relative z-10">
               <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                  <User size={28} strokeWidth={2.5} />
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Total Principal Investors</div>
                  <div className="text-3xl font-black text-slate-900 leading-none">{totalOwners}</div>
               </div>
            </div>
         </div>
         
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700" />
            <div className="flex items-center gap-5 relative z-10">
               <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                  <MapPin size={28} strokeWidth={2.5} />
               </div>
               <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Aggregate Stake Area</div>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-black text-slate-900">{aggregateKanal.toLocaleString()}</span>
                     <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">Kanal</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Search Matrix */}
      <div className="mb-6 flex justify-end">
        <div className="relative w-full md:w-80 group">
           <input 
              type="text"
              placeholder="Search by Identity or Phone..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-bold text-slate-700 transition-all group-hover:border-indigo-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={16} strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[30%]">Principal Identity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stake Coverage</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Contact</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[25%]">Asset Address</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                     <div className="flex flex-col items-center opacity-30 gap-3">
                        <Users size={48} className="text-slate-400" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-500">No principal investor records matching search.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredOwners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 bg-slate-100 flex items-center justify-center shrink-0">
                           <img 
                             src={`https://i.pravatar.cc/150?u=ittehad_principal_${owner.id}`} 
                             alt={owner.name} 
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors underline underline-offset-4 decoration-indigo-200 decoration-2">{owner.name}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">OWNR-{owner.id.toString().padStart(4, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-center gap-4 text-center">
                          <div className="flex flex-col">
                             <span className="text-[12px] font-black text-slate-800 leading-none">{owner.acre || 0}</span>
                             <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Acre</span>
                          </div>
                          <div className="flex flex-col border-x border-slate-100 px-3">
                             <span className="text-[12px] font-black text-slate-800 leading-none">{owner.kanal || 0}</span>
                             <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Kanal</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[12px] font-black text-slate-800 leading-none">{owner.marla || 0}</span>
                             <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Marla</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[12px] text-slate-700 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 w-fit">
                        <Phone size={14} className="text-indigo-500" strokeWidth={3} />
                        {owner.phone}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-black uppercase tracking-wide opacity-80 leading-snug">
                        <MapPin size={14} className="text-rose-400 shrink-0" strokeWidth={3} />
                        {owner.address || 'Principal HQ Registry'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openModal(`Edit: ${owner.name}`, <TownOwnerForm editData={owner} onRefresh={fetchOwners} />)}
                          className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Refine Profile"
                        >
                          <Edit2 size={16} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => handleDelete(owner.id)}
                          className="bg-rose-50 text-rose-600 p-2.5 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Erase Record"
                        >
                          <Trash2 size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchOwners} />)}
        className="btn-payment-top text-white shadow-gradient-red active:scale-95 z-[9999]"
        title="Forensic Payment"
      >
        <CreditCard size={24} strokeWidth={3} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchOwners} />)}
        className="btn-transfer-top text-white shadow-gradient-amber active:scale-95 z-[9999]"
        title="Stake Reallocation"
      >
        <Send size={24} strokeWidth={3} />
      </button>

      {/* Footer Audit Signature */}
      <footer className="mt-12 py-10 text-center border-t border-slate-200">
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">
            ITTEHAD COMMERCIAL CENTRE | PRINCIPAL AUDIT UNIT
         </div>
         <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 opacity-60">Verified Primary Acquisition Registry</p>
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest max-w-sm mx-auto leading-relaxed border border-slate-100 p-3 rounded-xl bg-white/50">
            Ownership stakes are cryptographically synchronized with the regional land registry. Any modification triggers a level-4 security audit.
         </p>
      </footer>
    </div>
  );
};

export default TownOwners;
