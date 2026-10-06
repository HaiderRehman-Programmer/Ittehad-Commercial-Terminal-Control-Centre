import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  Share2, 
  Edit2, 
  Trash2,
  User,
  CreditCard,
  Send,
  MapPin,
  Phone
} from 'lucide-react';
import { useModal } from '../components/Modal';
import LandOwnerForm from '../components/forms/LandOwnerForm';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import SkeletonTable from '../components/SkeletonTable';

const LandOwners = () => {
  const [owners, setOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Land Owners | Real Estate";
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const res = await api.get('/land-owners');
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
    if (window.confirm('Are you sure you want to delete this land owner?')) {
      try {
        await api.delete(`/land-owners/${id}`);
        setOwners(prev => prev.filter(o => o.id !== id));
        toast.success('Land owner deleted successfully');
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

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Land Management</a>
        <i className="fa fa-angle-right opacity-50 text-[10px]"></i>
        <small className="text-slate-400">Land Owners</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Land Owners</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Raw Land Asset Directory</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            disabled
            className="flex items-center gap-2 bg-slate-200 text-slate-500 px-4 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest cursor-not-allowed opacity-50"
            title="Module in development"
          >
            <Share2 size={14} /> 
            <span>Transfer to Town</span>
          </button>
          <button 
            onClick={() => openModal('Add Land Owner', <LandOwnerForm onRefresh={fetchOwners} />)}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> 
            <span>Add Land Owner</span>
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6 flex justify-end">
        <div className="relative max-w-xs w-full">
           <input 
              type="text"
              placeholder="Search Owners..."
              className="form-control w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
           </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                <th className="px-6 py-4 text-[11px] font-black tracking-widest">Name</th>
                <th className="px-6 py-4 text-[11px] font-black tracking-widest text-center">Land Holdings</th>
                <th className="px-6 py-4 text-[11px] font-black tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[11px] font-black tracking-widest">Address</th>
                <th className="px-6 py-4 text-[11px] font-black tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 font-medium italic">No land owners found matching your search.</td>
                </tr>
              ) : (
                filteredOwners.map((owner) => (
                  <tr key={owner.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0 text-slate-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-xl transition-transform group-hover:scale-110 duration-300 relative">
                           <img 
                             src={`https://i.pravatar.cc/150?u=ittehad_prop_${owner.id}`} 
                             alt={owner.name} 
                             className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-black text-slate-800 group-hover:text-teal-600 transition-colors leading-none mb-1 uppercase tracking-tight underline">{owner.name}</span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">PROP-{owner.id.toString().padStart(4, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex gap-4 text-slate-500 font-bold">
                         <div className="flex flex-col">
                            <span className="text-slate-800 text-[11px] leading-tight">{owner.acre || 0}</span>
                            <span className="text-[8px] uppercase tracking-tighter">Acre</span>
                         </div>
                         <div className="flex flex-col border-x border-slate-100 px-3">
                            <span className="text-slate-800 text-[11px] leading-tight">{owner.kanal || 0}</span>
                            <span className="text-[8px] uppercase tracking-tighter">Kanal</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-slate-800 text-[11px] leading-tight">{owner.marla || 0}</span>
                            <span className="text-[8px] uppercase tracking-tighter">Marla</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[12px] text-slate-700 font-bold">
                        <Phone size={14} className="text-slate-400" />
                        {owner.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[12px] text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-400" />
                        {owner.address || 'No address'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openModal(`Edit: ${owner.name}`, <LandOwnerForm editData={owner} onRefresh={fetchOwners} />)}
                          className="text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 p-2 rounded-lg border border-blue-100 shadow-sm"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(owner.id)}
                          className="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-2 rounded-lg border border-red-100 shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchOwners} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ffc107' }}
        title="Transfer"
      >
        <Send size={24} />
      </button>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest border-t border-slate-200 bg-white/50 rounded-xl">
          COPYRIGHT &copy; 2026 | ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default LandOwners;
