import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  CreditCard,
  Send,
  ToggleLeft,
  ToggleRight,
  MapPin,
  FileText
} from 'lucide-react';
import { useModal } from '../components/Modal';
import TownForm from '../components/forms/TownForm';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
import { generateStrategicPDF } from '../utils/reportUtils';
import { toTotalMarlas } from '../utils/financeUtils';

const Towns = () => {
  const [towns, setTowns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'archived'

  useEffect(() => {
    document.title = "Towns | Real Estate";
    fetchTowns();
     
  }, []);

  const fetchTowns = async () => {
    try {
      const res = await api.get('/towns');
      setTowns(res.data);
    } catch (err) {
      console.error(err);
      setTowns([]);
    } finally {
      setLoading(false);
    }
  };

  const { openModal } = useModal();

  const handleStatusToggle = async (id) => {
    try {
      await api.put(`/towns/${id}/toggle`);
      setTowns(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 1 ? 0 : 1 } : t));
      toast.success('Status updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this town?')) {
      try {
        await api.delete(`/towns/${id}`);
        setTowns(prev => prev.filter(t => t.id !== id));
        toast.success('Town deleted successfully');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete town');
      }
    }
  };

  const filteredTowns = towns.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && t.status === 1) ||
      (statusFilter === 'archived' && t.status === 0);
      
    return matchesSearch && matchesStatus;
  });

  const handleExportPDF = () => {
    const headers = ['Town Identity', 'Coverage (A/K/M)', 'Aggregate Kanal', 'Status'];
    const body = filteredTowns.map(t => [
      t.name.toUpperCase(),
      `${t.acre}/${t.kanal}/${t.marla}`,
      `${toTotalMarlas(t.acre, t.kanal, t.marla) / 20} K`,
      t.status === 1 ? 'ACTIVE' : 'ARCHIVED'
    ]);

    generateStrategicPDF({
      title: 'Regional Asset Registry Audit',
      subtitle: `Status: ${statusFilter.toUpperCase()} | Registered Headcount: ${filteredTowns.length} | Generated: ${new Date().toLocaleDateString()}`,
      headers,
      body,
      filename: `town_audit_${new Date().getTime()}.pdf`
    });
  };

  const totalRegionalKanal = filteredTowns.reduce((sum, t) => sum + ((t.acre * 8) + t.kanal + (t.marla / 20)), 0);
  const activeRegions = filteredTowns.filter(t => t.status === 1).length;

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-indigo-600 transition-colors tracking-widest">Regional Hub</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Town Registry</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Regional Town Matrix
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse-slow" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Global Asset Hub</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Macro Inventory Verification Ledger</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            <FileText size={16} strokeWidth={3} /> 
            <span>Strategic Export</span>
          </button>
          <button 
            onClick={() => openModal('Add New Town', <TownForm onRefresh={fetchTowns} />)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> 
            <span>Add Town</span>
          </button>
        </div>
      </div>

      {/* KPI Pulse Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100 transition-all duration-700" />
           <div className="relative z-10">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500" />
                 Total Regional Footprint
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-slate-900">{totalRegionalKanal.toLocaleString()}</span>
                 <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">Aggregate Kanal</span>
              </div>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100 transition-all duration-700" />
           <div className="relative z-10">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 Active Development Zones
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-slate-900">{activeRegions}</span>
                 <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">Active Regions</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-100 transition-all duration-700" />
           <div className="relative z-10">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500" />
                 Total Unit Count
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-black text-slate-900">{filteredTowns.length}</span>
                 <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">Registered Hubs</span>
              </div>
           </div>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          {[
            { id: 'all', label: 'All Regions' },
            { id: 'active', label: 'Active Zones' },
            { id: 'archived', label: 'Archives' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Search */}
        <div className="relative w-full md:w-80 group">
           <input 
              type="text"
              placeholder="Search regional directory..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-bold text-slate-600 transition-all group-hover:border-indigo-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
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
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Region Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Land Coverage</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Aggregate Area</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Asset Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredTowns.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12">
                      <EmptyState 
                        title="No Town Matrices Found" 
                        description="The property geography is currently void of any town records matching your search."
                        icon={MapPin}
                        action={{
                          label: "Refresh Geography",
                          onClick: fetchTowns
                        }}
                      />
                   </td>
                </tr>
              ) : (
                filteredTowns.map((town) => {
                  const areaKanal = (town.acre * 8) + town.kanal + (town.marla / 20);
                  return (
                    <tr key={town.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm transition-transform group-hover:scale-110">
                            <MapPin size={22} className="stroke-[2.5]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight">{town.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{town.address || 'Regional HQ'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-5 text-center">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-black text-slate-800 leading-none">{town.acre}</span>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Acre</span>
                          </div>
                          <div className="flex flex-col border-x border-slate-100 px-4">
                            <span className="text-[12px] font-black text-slate-800 leading-none">{town.kanal}</span>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Kanal</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-black text-slate-800 leading-none">{town.marla}</span>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Marla</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="inline-flex flex-col items-end px-3 py-1.5 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                            <span className="text-[14px] font-black text-emerald-400 leading-none">
                              {areaKanal} <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter ml-1">K</span>
                            </span>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                               <div className="h-full bg-emerald-500 w-[65%]" />
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => handleStatusToggle(town.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
                            town.status === 1 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                           {town.status === 1 ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} className="text-slate-400" />}
                           {town.status === 1 ? 'Live Zone' : 'Archived'}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => openModal(`Edit: ${town.name}`, <TownForm editData={town} onRefresh={fetchTowns} />)}
                            className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Refine Registry"
                          >
                            <Edit2 size={16} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleDelete(town.id)}
                            className="bg-rose-50 text-rose-600 p-2.5 rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Purge Record"
                          >
                            <Trash2 size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Secondary Analytics Footer */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
         <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Asset Liquidity Report</h4>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest opacity-60">
               Regional land holdings are verified against primary acquisition ledgers. Unit density is periodically audited for market saturation.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="text-right">
               <div className="text-[20px] font-black text-slate-900 leading-none">100%</div>
               <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Registry Accuracy</div>
            </div>
            <div className="w-px h-10 bg-slate-100 self-center" />
            <div className="text-right">
               <div className="text-[20px] font-black text-slate-900 leading-none">v4.2</div>
               <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Audit Protocol</div>
            </div>
         </div>
      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchTowns} />)}
        className="btn-payment-top text-white shadow-gradient-red active:scale-95 z-[9999]"
        title="Forensic Payment"
      >
        <CreditCard size={24} strokeWidth={3} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchTowns} />)}
        className="btn-transfer-top text-white shadow-gradient-amber active:scale-95 z-[9999]"
        title="Asset Reallocation"
      >
        <Send size={24} strokeWidth={3} />
      </button>

      {/* Footer Branding */}
      <footer className="mt-12 py-10 text-center border-t border-slate-200">
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">
            ITTEHAD COMMERCIAL CENTRE | COMMAND CONSOLE
         </div>
         <p className="text-[10px] font-bold text-slate-400 tracking-widest">COPYRIGHT &copy; 2026 | ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default Towns;
