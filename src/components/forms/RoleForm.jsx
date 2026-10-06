import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Shield, Save, X, Lock } from 'lucide-react';


const RoleForm = ({ role, onRefresh, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(role?.name || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (role?.id) {
        await api.put(`/roles/${role.id}`, { name, permissions: role.permissions });
      } else {
        await api.post('/roles', { name });
      }
      toast.success(role?.id ? 'Authority Updated' : 'Authority Initialized');
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sync role data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 pb-6 flex flex-col items-center">
      <div className="w-full mb-8 flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-indigo-500/20 transition-all duration-700" />
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <Shield size={22} strokeWidth={3} />
        </div>
        <div className="relative z-10">
          <h3 className="text-[13px] font-black text-white uppercase tracking-tight leading-none mb-1.5">
            {role?.id ? 'Refine Directive' : 'Initialize Authority'}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
            Global Personnel Access Infrastructure
          </p>
        </div>
      </div>

      {error && (
        <div className="w-full mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black rounded-2xl flex items-center gap-3 uppercase tracking-tight shadow-sm">
          <X size={16} strokeWidth={3} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 italic">Standard Identifier</label>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Lock size={16} strokeWidth={3} />
            </div>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
              className="w-full bg-slate-50 border border-slate-200 py-4.5 pl-14 pr-6 rounded-[1.5rem] text-[15px] font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all shadow-inner" 
              placeholder="e.g. Recovery Officer" 
            />
          </div>
          <p className="text-[9px] text-slate-400 mt-4 ml-2 font-bold uppercase tracking-widest leading-relaxed">
            Note: System-protected groups like 'Super Admin' cannot be renamed through this portal.
          </p>
        </div>

        <div className="pt-4 px-2">
           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-slate-900/40 flex items-center justify-center gap-4 active:scale-95 hover:-translate-y-1 transition-all text-sm uppercase tracking-[0.2em] border-b-4 border-slate-700"
           >
             {loading ? (
               <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <>
                 <Save size={20} strokeWidth={3} />
                 <span>Authorize Changes</span>
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
