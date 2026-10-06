import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Lock,
  Save,
  X
} from 'lucide-react';

const UserForm = ({ onRefresh, onClose, editData = null }) => {
  const [formData, setFormData] = useState(() => ({
    name: editData?.name || '',
    email: editData?.email || '',
    role: editData?.role || 'Accountant',
    mobile_no: editData?.mobile_no || '',
    password: ''
  }));
  const [roles, setRoles] = useState([]);

  async function fetchRoles() {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    let isMounted = true;
    setTimeout(async () => {
      if (!isMounted) return;
      if (editData) {
        setFormData(prev => ({ ...prev, ...editData, password: '' }));
      }
      await fetchRoles();
    }, 0);
    return () => { isMounted = false; };
  }, [editData]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await api.put(`/users/${editData.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error saving user. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-4 font-sans h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 transition-all hover:bg-white hover:shadow-md">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <User size={10} className="text-indigo-600" /> Full Legal Name
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g., Salman Iqbal"
              className={`bg-transparent border-none focus:ring-0 text-sm font-bold w-full transition-all ${formData.name ? 'text-slate-800' : 'text-slate-400 opacity-50'}`}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
        </div>

        {/* Email */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 transition-all hover:bg-white hover:shadow-md">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Mail size={10} className="text-indigo-600" /> Email Identity
            </label>
            <input 
              type="email" 
              required
              placeholder="name@ittehad.com"
              className={`bg-transparent border-none focus:ring-0 text-sm font-bold w-full transition-all ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'text-indigo-600' : 'text-slate-800'}`}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
        </div>

        {/* Mobile */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 transition-all hover:bg-white hover:shadow-md">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Phone size={10} className="text-indigo-600" /> Mobile Number
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g., 0300 0000000"
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-slate-300 w-full"
              value={formData.mobile_no}
              onChange={(e) => setFormData({...formData, mobile_no: e.target.value})}
            />
        </div>

        {/* Role */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 transition-all hover:bg-white hover:shadow-md">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Shield size={10} className="text-indigo-600" /> System Access Role
            </label>
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-slate-300 w-full cursor-pointer"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Super Admin">Corporate Director</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
              <option value="Accountant">Accounting Officer</option>
              <option value="Sale Assistant">Front Desk / Sales</option>
            </select>
        </div>

        {/* Password */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 transition-all hover:bg-white hover:shadow-md md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Lock size={10} className="text-indigo-600" /> Administrative Password
            </label>
            <input 
              type="password" 
              required={!editData}
              placeholder="••••••••"
              className={`bg-transparent border-none focus:ring-0 text-sm font-bold w-full transition-all ${formData.password.length >= 6 ? 'text-emerald-500' : 'text-slate-800'}`}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-slate-100">
        <button 
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
        >
          Discard
        </button>
        <button 
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/10 active:scale-95"
        >
          <Save size={18} className="stroke-[3]" />
          <span>Onboard Team Member</span>
        </button>
      </div>
    </form>
  );
};

export default UserForm;
