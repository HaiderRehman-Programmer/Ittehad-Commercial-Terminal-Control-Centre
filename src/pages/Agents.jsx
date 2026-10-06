import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  Phone,
  Briefcase,
  Star,
  Target,
  DollarSign,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useModal } from '../components/Modal';
import AgentPayoutForm from '../components/forms/AgentPayoutForm';
import { formatPKR } from '../utils/financeUtils';
import EmptyState from '../components/EmptyState';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openModal, closeModal } = useModal();

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/agents');
      const agentsList = res.data.data || res.data;
      const agentsWithStats = await Promise.all(agentsList.map(async (agent) => {
         const stats = await api.get(`/agents/${agent.id}/stats`);
         return { ...agent, stats: stats.data };
      }));
      setAgents(agentsWithStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Sales Intelligence Hub | ITTEHAD Commercial";
    fetchAgents();
  }, [fetchAgents]);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      await api.post('/agents', data);
      toast.success('Professional Agent Onboarded');
      fetchAgents();
      closeModal();
    } catch {
      toast.error('Onboarding Protocol Failed');
    }
  };

  const totalSalesCap = agents.reduce((sum, a) => sum + (a.stats?.totalSales || 0), 0);
  const totalCommLiab = agents.reduce((sum, a) => sum + (a.stats?.totalCommission || 0), 0);

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-amber-600 transition-colors tracking-widest">Personnel Matrix</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Sales Intelligence Hub</small>
      </nav>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Sales Force Repository
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
               <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Active Intelligence</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Dossier-Level Performance & Commission Audit</p>
        </div>
        
        <div className="flex gap-3">
          <button 
             onClick={fetchAgents}
             className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all shadow-sm active:rotate-180 duration-500"
             title="Sync Force Matrix"
          >
             <RotateCcw size={18} strokeWidth={3} />
          </button>
          <button 
            onClick={() => openModal('Onboard New Professional', (
               <div className="p-6">
                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                       <Plus size={24} />
                    </div>
                    <p className="text-xs text-amber-800 font-bold leading-tight uppercase tracking-tight">Initialize new sales identity and define commission directive.</p>
                 </div>
                 <form onSubmit={handleAddAgent} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Agent Full Identity</label>
                      <input name="name" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[13px] font-black focus:ring-4 focus:ring-amber-500/5 transition-all" placeholder="Legal Name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                        <input name="phone" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[13px] font-black focus:ring-4 focus:ring-amber-500/5 transition-all" placeholder="+92 300 0000000" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Comm. Level (%)</label>
                        <input name="commission_rate" type="number" step="0.1" defaultValue="5" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[13px] font-black focus:ring-4 focus:ring-amber-500/5 transition-all" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-[12px] uppercase tracking-widest">
                         Confirm Onboarding
                      </button>
                    </div>
                 </form>
               </div>
            ))}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-slate-700 hover:-translate-y-1"
          >
            <Plus size={16} strokeWidth={4} /> 
            <span>Initialize Identity</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Force Capacity', value: agents.length, sub: 'Active Agents', icon: Users, color: 'indigo' },
          { label: 'Booking Aggregate', value: agents.reduce((sum, a) => sum + (a.stats?.bookings || 0), 0), sub: 'Total Conversions', icon: Target, color: 'blue' },
          { label: 'Sales Under Mgmt', value: formatPKR(totalSalesCap), sub: 'Portfolio Value', icon: TrendingUp, color: 'emerald' },
          { label: 'Comm. Liability', value: formatPKR(totalCommLiab), sub: 'Outstanding Dues', icon: DollarSign, color: 'rose' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-colors">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${kpi.color}-50/30 rounded-full blur-2xl -mr-6 -mt-6`} />
            <div className={`w-9 h-9 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center mb-3 border border-${kpi.color}-100 shadow-inner shrink-0 leading-none`}>
              <kpi.icon size={18} strokeWidth={3} />
            </div>
            <div className="text-[17px] font-black text-slate-900 tracking-tight leading-none mb-1">{kpi.value}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse" />)}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {agents.length === 0 && (
             <div className="col-span-full py-12">
                <EmptyState 
                  title="No Sales Force Identity" 
                  description="The personnel matrix is currently void of any active sales professionals."
                  icon={Briefcase}
                  action={{
                    label: "Re-Sync Matrix",
                    onClick: fetchAgents
                  }}
                />
             </div>
           )}
           {!loading && agents.map(agent => (
             <div key={agent.id} className="bg-white border border-slate-200 rounded-[3rem] p-1 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden">
                <div className="p-8 relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-50 transition-all duration-700" />
                  
                  <div className="flex items-center gap-5 mb-8 relative z-10">
                     <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20 group-hover:rotate-6 transition-transform">
                        <Users size={24} strokeWidth={2.5} />
                     </div>
                     <div>
                        <h3 className="font-black text-slate-800 text-lg tracking-tight leading-none uppercase mb-2 group-hover:text-amber-600 transition-colors">{agent.name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                           <Phone size={10} className="text-amber-500" />
                           {agent.phone || 'NO CONTACT'}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1.5 opacity-60 italic">
                           Conversations
                        </div>
                        <p className="text-slate-800 font-black text-xl">{agent.stats?.bookings || 0} Units</p>
                     </div>
                     <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-2 text-[9px] font-black text-amber-500 tracking-widest uppercase mb-1.5 opacity-60 italic">
                           Directives
                        </div>
                        <p className="text-amber-600 font-black text-xl">{agent.commission_rate}% Rate</p>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2rem] p-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <TrendingUp size={72} className="text-white" />
                     </div>
                     <div className="relative z-10">
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 italic">
                           <DollarSign size={10} strokeWidth={3} />
                           Commission Reservoir
                        </div>
                        <div className="text-white font-black text-2xl tracking-tighter mb-4">
                           {formatPKR(agent.stats?.totalCommission || 0)}
                        </div>
                        
                        <button 
                          onClick={() => openModal(`Commission Payout: ${agent.name}`, <AgentPayoutForm agent={agent} onRefresh={fetchAgents} />)}
                          className="w-full bg-white text-slate-900 hover:bg-amber-400 font-black py-3 rounded-xl shadow-lg transition-all text-[11px] uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
                        >
                           Process Liquidation
                           <ArrowRight size={14} strokeWidth={3} />
                        </button>
                     </div>
                  </div>
                </div>
             </div>
           ))}
        </div>
      )}

      <footer className="mt-12 py-12 text-center border-t border-slate-200">
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">
            ITTEHAD COMMERCIAL CENTRE | SALES INTELLIGENCE DIVISION
         </div>
         <p className="text-[10px] font-bold text-slate-400 tracking-widest max-w-lg mx-auto leading-relaxed border border-slate-100 p-4 rounded-2xl bg-white/50 shadow-sm opacity-80 uppercase italic">
            Sales identity and commission velocity are audited in real-time. Payout directives are synchronized with the central double-entry matrix.
         </p>
      </footer>
    </div>
  );
};

export default AgentManagement;
