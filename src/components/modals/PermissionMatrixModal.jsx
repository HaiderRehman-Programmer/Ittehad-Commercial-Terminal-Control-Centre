import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Save, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  Activity, 
  Menu,
  CheckSquare,
  Square
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const MODULES = [
  { id: 'inventory', label: 'Land & Inventory', icon: Menu },
  { id: 'recovery', label: 'Recovery Intelligence', icon: Activity },
  { id: 'finance', label: 'Financial Ledgers', icon: Shield },
  { id: 'bookings', label: 'Booking Desk', icon: Edit },
  { id: 'users', label: 'Personnel Management', icon: Shield },
  { id: 'audit', label: 'Forensic Audit Logs', icon: Square }
];

const PERMISSION_LEVELS = [
  { id: 'none', label: 'Denied', icon: X, color: 'slate' },
  { id: 'viewer', label: 'Viewer', icon: Eye, color: 'blue' },
  { id: 'operator', label: 'Operator', icon: Edit, color: 'indigo' },
  { id: 'auditor', label: 'Auditor', icon: Shield, color: 'emerald' },
  { id: 'super', label: 'Super Admin', icon: Activity, color: 'rose' }
];

const PermissionMatrixModal = ({ roleId, roleName, onClose, onRefresh }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRoleDetails = useCallback(async () => {
    try {
      const res = await api.get(`/roles`);
      const role = res.data.find(r => r.id === roleId);
      if (role?.permissions) {
        setPermissions(JSON.parse(role.permissions));
      } else {
        // Initialize empty permissions
        const init = {};
        MODULES.forEach(m => init[m.id] = 'none');
        setPermissions(init);
      }
    } catch {
      toast.error('Failed to load authorization matrix');
    } finally {
      setLoading(false);
    }

  }, [roleId]);

  useEffect(() => {
    fetchRoleDetails();
  }, [fetchRoleDetails]);

  const handleToggle = (moduleId, levelId) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: levelId
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/roles/${roleId}`, {
        name: roleName,
        permissions: permissions
      });
      toast.success('Authorization Registry Updated');
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch {
      toast.error('Forensic Update Failed');
    } finally {
      setSaving(false);
    }

  };

  if (loading) return (
    <div className="p-20 flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Shield className="text-indigo-400" size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Authorization Matrix</span>
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{roleName} Directives</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Scale: Viewer → Operator → Auditor → Super</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          {MODULES.map((module) => (
            <div key={module.id} className="group">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <module.icon size={16} strokeWidth={3} />
                 </div>
                 <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{module.label}</span>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {PERMISSION_LEVELS.map((level) => {
                  const isActive = permissions[module.id] === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => handleToggle(module.id, level.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                        isActive 
                          ? `bg-${level.color}-50 border-${level.color}-200 ring-2 ring-${level.color}-500/20` 
                          : 'bg-white border-slate-100 hover:border-slate-300 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                      }`}
                    >
                      <level.icon size={14} strokeWidth={3} className={isActive ? `text-${level.color}-600` : 'text-slate-400'} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? `text-${level.color}-700` : 'text-slate-400'}`}>
                        {level.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
           >
             {saving ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
             ) : (
               <>
                 <Save size={18} strokeWidth={3} />
                 <span>Sync Authorization</span>
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrixModal;
