import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { MapPin, Home, Save, X, Navigation } from 'lucide-react';

/* eslint-disable react-refresh/only-export-components */
export default function TownForm({ editData = null, onRefresh, onClose }) {


  const [formData, setFormData] = useState({
    name: '',
    address: '',
    acre: 0,
    kanal: 0,
    marla: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        address: editData.address || '',
        acre: editData.acre || 0,
        kanal: editData.kanal || 0,
        marla: editData.marla || 0
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        acre: parseFloat(formData.acre) || 0,
        kanal: parseFloat(formData.kanal) || 0,
        marla: parseFloat(formData.marla) || 0
      };

      if (editData) {
        await api.put(`/towns/${editData.id}`, payload);
        toast.success('Town updated successfully');
      } else {
        await api.post('/towns', payload);
        toast.success('Town added successfully');
      }
      
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save town details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 px-5 pb-6 bg-white rounded-xl max-w-lg mx-auto font-sans">
      <div className="mb-6 flex items-center gap-3 p-4 bg-teal-50 border border-teal-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-lg">
          <MapPin size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-teal-900 leading-tight uppercase tracking-tight">Town Setup</h3>
          <p className="text-[11px] text-teal-700 font-medium">Record geographic and structural details for a development project.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
            <Home size={10} className="text-teal-600" /> Town Name Identity
          </label>
          <input 
            required 
            className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" 
            placeholder="e.g. Garden Town Phase II" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
            <Navigation size={10} className="text-teal-600" /> Geographic Location / Address
          </label>
          <textarea 
            className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none min-h-[80px] resize-none" 
            placeholder="Complete address or landmarks..." 
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Total Acre</label>
            <input 
              type="number" step="0.01"
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" 
              value={formData.acre}
              onChange={(e) => setFormData({...formData, acre: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kanal</label>
            <input 
              type="number" step="0.01"
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" 
              value={formData.kanal}
              onChange={(e) => setFormData({...formData, kanal: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Marla</label>
            <input 
              type="number" step="0.01"
              className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" 
              value={formData.marla}
              onChange={(e) => setFormData({...formData, marla: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-xl shadow-lg shadow-teal-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                <span>{editData ? 'Update Record' : 'Create Town'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

