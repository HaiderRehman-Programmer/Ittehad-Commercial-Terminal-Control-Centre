import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Send
} from 'lucide-react';
import { useModal } from '../components/Modal';

const InstallmentTypes = () => {
  const [types, setTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    document.title = "Installment Types | Real Estate";
    fetchTypes();
     
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts?type=income');
      setTypes(res.data);
    } catch (err) {
      console.error(err);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get('name');
    try {
      await api.post('/accounts', { name, type: 'income', code: 'INST-' + Date.now() });
      fetchTypes();
      closeModal();
    } catch {
      toast.error('Failed to save installment type');
    }
  };

  const showAddModal = () => {
    openModal('Manage Installment Type', (
      <form onSubmit={handleAddType} className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type Name</label>
          <input name="name" required className="w-full border border-slate-200 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 48-Month Plan" />
        </div>
        <button type="submit" className="w-full bg-[#5D78FF] text-white font-bold py-2 rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Save Changes</button>
      </form>
    ));
  };

  const handleStatusToggle = (id) => {
    setTypes(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 1 ? 0 : 1 } : t));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await api.delete(`/accounts/${id}`);
        setTypes(prev => prev.filter(t => t.id !== id));
      } catch {
        toast.error('Failed to delete installment type');
      }
    }
  };

  const filteredTypes = types.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Settings</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">Types</small>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#333]">Installment Types</h1>
        <button 
          onClick={showAddModal}
          className="bg-[#5D78FF] text-white px-4 py-2 rounded-md text-[13px] font-bold flex items-center gap-2"
        >
          <Plus size={16} /> Add Type
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-end">
        <div className="relative max-w-xs w-full">
           <input 
              type="text"
              placeholder="Search Types..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
           </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm p-8">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse mb-3" />
          ))}
        </div>
      ) : (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-[12px] font-bold uppercase">Name</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase text-center">Status</th>
              <th className="px-6 py-4 text-[12px] font-bold uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTypes.length === 0 ? (
              <tr><td colSpan="3" className="text-center py-12 text-slate-400 font-medium italic">No installment types found.</td></tr>
            ) : (
            filteredTypes.map((type) => (
              <tr key={type.id} className="border-b border-slate-50">
                <td className="px-6 py-4 text-[13px] font-medium">{type.name}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleStatusToggle(type.id)}>
                    {type.status === 1 ? <ToggleRight className="text-teal-500" /> : <ToggleLeft className="text-slate-300" />}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleDelete(type.id)} className="text-rose-500 p-2"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};

export default InstallmentTypes;
