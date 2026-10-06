import { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Search, 

  FileText, 
  MapPin, 
  Tag as TagIcon,
  CheckCircle,
  Clock,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import SkeletonTable from '../components/SkeletonTable';
import { generateStrategicPDF } from '../utils/reportUtils';
import { useModal } from '../components/Modal';
import PlotForm from '../components/forms/PlotForm';

const Plots = () => {
  const [plots, setPlots] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  useEffect(() => {
    document.title = "Plot Registry | Real Estate";
    fetchPlots();
  }, []);

  const fetchPlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/map');
      setPlots(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setPlots([]);
    } finally {
      setLoading(false);
    }
  };

  const totals = {
    total: plots.length,
    available: plots.filter(p => p.status === 'available').length,
    sold: plots.filter(p => p.status === 'sold').length,
    reserved: plots.filter(p => p.status === 'reserved').length
  };

  const filteredPlots = plots.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.plot_no || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      p.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  const handleExportPDF = () => {
    const headers = ['Identity', 'Area/Dimensions', 'Owner/Affiliate', 'Status', 'Audit Flag'];
    const body = filteredPlots.map(p => [
      p.name.toUpperCase(),
      `${p.marla} Marla (${p.dimensions})`,
      p.status === 'sold' ? 'ALLOCATED' : 'AVAILABLE',
      p.status.toUpperCase(),
      p.status === 'available' ? 'LIQUID ASSET' : 'VERIFIED SALE'
    ]);

    generateStrategicPDF({
      title: 'Global Asset Registry Audit',
      subtitle: `Status: ${statusFilter.toUpperCase()} | Units: ${filteredPlots.length} | Generated: ${new Date().toLocaleDateString()}`,
      headers,
      body,
      filename: `plot_registry_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-indigo-600 transition-colors tracking-widest">Inventory</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Plot Registry</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Unit Inventory Registry
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Live Sync</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Forensic Asset Verification Terminal</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
          >
            <FileText size={16} strokeWidth={3} /> 
            <span>Forensic Export</span>
          </button>
          <button 
             onClick={() => openModal('Add New Plot', <PlotForm onRefresh={fetchPlots} onClose={() => {}} />)}
             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95 translate-y-0 hover:-translate-y-1"
          >
            <Plus size={16} strokeWidth={3} /> 
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Pulse Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Units', value: totals.total, icon: MapPin, color: 'indigo' },
          { label: 'Market Available', value: totals.available, icon: CheckCircle, color: 'emerald' },
          { label: 'Aggregate Sold', value: totals.sold, icon: TagIcon, color: 'rose' },
          { label: 'Reserved Buffer', value: totals.reserved, icon: Clock, color: 'amber' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-50/50 rounded-full blur-2xl -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center mb-4 border border-${kpi.color}-100 shadow-inner`}>
              <kpi.icon size={20} strokeWidth={3} />
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{kpi.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filter & Search Matrix */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Units' },
            { id: 'available', label: 'Liquid' },
            { id: 'sold', label: 'Allocated' },
            { id: 'reserved', label: 'Reserved' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-fit ${
                statusFilter === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
             <input 
                type="text"
                placeholder="Search Identity/Unit #..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-bold text-slate-700 transition-all border-l-4 border-l-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Search size={18} strokeWidth={3} />
             </div>
          </div>
          <button 
             onClick={fetchPlots}
             className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:rotate-180 duration-500"
             title="Synchronize Data"
          >
             <RotateCcw size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
        {loading ? (
          <SkeletonTable rows={10} columns={5} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-[40%]">Asset Identity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Coverage Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Lifecycle Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Action matrix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPlots.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-30 gap-3">
                       <MapPin size={48} className="text-slate-400" />
                       <p className="text-sm font-black uppercase tracking-widest text-slate-500 italic">No asset records registered under this criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPlots.map((plot) => (
                  <tr key={plot.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                          plot.status === 'available' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                          plot.status === 'sold' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                          'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                          <TagIcon size={20} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{plot.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{plot.plot_type || 'Residential'} • #{plot.plot_no || 'UNIT-OFF'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-[13px] font-black text-slate-700">{plot.marla} <span className="text-[10px] text-slate-400 uppercase tracking-tighter ml-0.5">Marla</span></span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5 italic">{plot.dimensions || 'N/A Dimensions'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                          plot.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          plot.status === 'sold' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                       }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             plot.status === 'available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                             plot.status === 'sold' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
                             'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          }`} />
                          {plot.status}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-slate-100 text-slate-400 shadow-sm active:scale-90 duration-300">
                             <ExternalLink size={16} strokeWidth={3} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Audit Signature */}
      <footer className="mt-12 py-10 text-center border-t border-slate-200">
         <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
               <span>Automated Audit</span>
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
               <span>Asset Registry v4.2</span>
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest max-w-sm leading-relaxed opacity-60">
               Forensic inventory tracking enabled. All unit lifecycle transitions are cryptographically logged in the security matrix.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Plots;
