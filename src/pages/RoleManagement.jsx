import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  ShieldCheck,
  Edit,
  Edit2, 
  Trash2,
  Lock,
  CreditCard,
  Send,
  RotateCcw
} from 'lucide-react';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import RoleForm from '../components/forms/RoleForm';
import SkeletonTable from '../components/SkeletonTable';
import PermissionMatrixModal from '../components/modals/PermissionMatrixModal';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    document.title = "Authority Matrix | ITTEHAD Commercial";
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const isProtected = (name) => {
    return ['Super Admin', 'Income', 'Expense', 'Viewer'].includes(name);
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-indigo-600 transition-colors tracking-widest">System Architecture</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Authorization Registry</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Security Directives
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Auth Matrix Active</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Dossier-Level Permission Infrastructure</p>
        </div>
        
        <div className="flex gap-3">
          <button 
             onClick={fetchRoles}
             className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:rotate-180 duration-500"
             title="Synchronize Authority"
          >
             <RotateCcw size={18} strokeWidth={3} />
          </button>
          <button 
            onClick={() => openModal('Initialize New Authority', <RoleForm onRefresh={fetchRoles} />)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-slate-700 hover:-translate-y-1"
          >
            <Plus size={16} strokeWidth={4} /> 
            <span>Initialize Role</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
              <ShieldCheck size={24} strokeWidth={3} />
           </div>
           <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Defined Roles</div>
              <div className="text-2xl font-black text-slate-900">{roles.length}</div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
              <Lock size={24} strokeWidth={3} />
           </div>
           <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Protected Assets</div>
              <div className="text-2xl font-black text-slate-900">4 Core Tiers</div>
           </div>
        </div>
        <div className="relative group overflow-hidden">
           <input 
              type="text"
              placeholder="Filter Authorization Ledgers..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-[13px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 shadow-sm font-bold text-slate-700 transition-all group-hover:border-indigo-300 border-l-8 border-l-indigo-600 h-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={18} strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Role Matrix Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
        {loading ? (
          <SkeletonTable rows={5} columns={2} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Authority Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Directive Integrity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                        isProtected(role.name) ? 'bg-amber-50 border-amber-100 text-amber-600 shadow-sm' : 'bg-white border-slate-200 text-indigo-400 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                      }`}>
                        {isProtected(role.name) ? <Lock size={20} strokeWidth={3} /> : <ShieldCheck size={20} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[15px] font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-1.5">{role.name}</span>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                            {isProtected(role.name) ? 'System Protected Registry' : `Authority ID: #${role.id}`}
                         </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <button 
                       onClick={() => openModal(`Directive Configuration: ${role.name}`, <PermissionMatrixModal roleId={role.id} roleName={role.name} onRefresh={fetchRoles} />)}
                       className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-black transition-all shadow-lg active:scale-95"
                     >
                       <Edit size={14} strokeWidth={3} />
                       Modify Directives
                     </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       {!isProtected(role.name) && (
                         <>
                            <button 
                               onClick={() => openModal(`Edit Authority: ${role.name}`, <RoleForm role={role} onRefresh={fetchRoles} />)}
                               className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                               title="Edit"
                            >
                               <Edit2 size={16} strokeWidth={3} />
                            </button>
                            <button 
                               onClick={async () => {
                                 if (window.confirm('IRREVERSIBLE: Delete this authority ledger?')) {
                                    try {
                                      await api.delete(`/roles/${role.id}`);
                                      fetchRoles();
                                    } catch (err) { console.error(err); }
                                 }
                               }}
                               className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                               title="Destroy"
                            >
                               <Trash2 size={16} strokeWidth={3} />
                            </button>
                         </>
                       )}
                       {isProtected(role.name) && (
                          <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Locked Asset</span>
                          </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRoles.length === 0 && (
                <tr>
                   <td colSpan={3} className="py-24 text-center opacity-30 italic font-black uppercase tracking-widest text-slate-400">
                      No authorization ledgers found.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Forensic Branding Footer */}
      <footer className="mt-12 py-12 text-center border-t border-slate-200">
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">
            ITTEHAD COMMERCIAL CENTRE | SECURITY ARCHITECTURE UNIT
         </div>
         <p className="text-[10px] font-bold text-slate-400 tracking-widest max-w-lg mx-auto leading-relaxed border border-slate-100 p-4 rounded-2xl bg-white/50 shadow-sm opacity-80 uppercase italic">
            Access directives are enforced via the centralized authority matrix. Any unauthorized ledger tampering will be flagged by forensic audit logs.
         </p>
      </footer>
    </div>
  );
};

export default RoleManagement;
