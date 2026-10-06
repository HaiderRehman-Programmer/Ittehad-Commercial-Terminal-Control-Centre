import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { 
  Plus, 
  Upload, 
  CreditCard,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  Bookmark,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import PlotForm from '../components/forms/PlotForm';
import PropertyDossier from '../components/modals/PropertyDossier';
import EmptyState from '../components/EmptyState';
import { generateStrategicPDF } from '../utils/reportUtils';

const MapPage = () => {
  const [data, setData] = useState([]);
  const [towns, setTowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [townFilter, setTownFilter] = useState('all');
  const [density, setDensity] = useState('md'); // sm, md, lg
  const navigate = useNavigate();

  const fetchData = useCallback(async (isInitial = false) => {
    setLoading(true);
    try {
      const params = townFilter !== 'all' ? { townId: townFilter } : {};
      
      if (isInitial) {
        const [mapRes, townsRes] = await Promise.all([
          api.get('/map', { params }),
          api.get('/towns')
        ]);
        setData(Array.isArray(mapRes.data) ? mapRes.data : (mapRes.data?.data || []));
        setTowns(Array.isArray(townsRes.data) ? townsRes.data : (townsRes.data?.data || []));
      } else {
        const res = await api.get('/map', { params });
        setData(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      }
    } catch (err) {
      console.error('Error fetching map data:', err);
      if (!isInitial) setData([]);
    } finally {
      setLoading(false);
    }
  }, [townFilter]);

  useEffect(() => {
    document.title = "Unified Inventory Map | ITTEHAD Commercial";
    fetchData(true);
  }, [fetchData]);


  const { openModal } = useModal();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this plot/shop?")) {
       toast.success(`Map #${id} deleted successfully`);
       setData(data.filter(item => item.id !== id));
    }
    setActiveDropdown(null);
  };

  const handleExportPDF = () => {
    const headers = ['Plot/Shop NAME', 'Land SIZE', 'DIMENSIONS', 'PROJECT STATUS'];
    const body = filteredData.map(item => [
      item.name.toUpperCase(),
      item.marla,
      item.dimensions,
      item.status.toUpperCase()
    ]);

    generateStrategicPDF({
      title: 'Current Project Inventory Log',
      subtitle: `Filter: ${statusFilter.toUpperCase()} | Search: ${searchTerm || 'Full Archive'} | Availability Headcount: ${filteredData.length}`,
      headers,
      body,
      filename: `inventory_audit_${new Date().getTime()}.pdf`
    });
  };

  // Filtering Logic
  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = data.filter(item => item.status === 'available').length;
  const tokenCount = data.filter(item => item.status === 'token').length;
  const bookedCount = data.filter(item => item.status === 'booked').length;
  const soldCount = data.filter(item => item.status === 'sold').length;

  const densityClasses = {
    sm: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 text-[10px]',
    md: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4',
    lg: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6'
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Map</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">ITTEHAD COMMERCIAL CENTRE</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-tight uppercase tracking-tight">Project Inventory Map</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">ITTEHAD COMMERCIAL CENTRE</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Export Button */}
          <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
             <FileText size={16} strokeWidth={3} />
             <span>Export Log</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
             <input 
                type="text" 
                placeholder="Search Plot/Shop..." 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[12px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none w-48 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Town Selector */}
          <div className="relative">
             <select 
               className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[12px] font-bold outline-none appearance-none pr-10 shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-700"
               value={townFilter}
               onChange={(e) => setTownFilter(e.target.value)}
             >
                <option value="all">All Projects</option>
                {towns.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
             </select>
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Search size={14} className="opacity-0" /> {/* Placeholder for spacing */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>

          <button 
            onClick={() => openModal('Onboard Plot / Shop', <PlotForm onRefresh={fetchData} selectedTownId={townFilter !== 'all' ? townFilter : null} />)}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={16} className="stroke-[3]" /> 
            <span>Create Inventory</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
           {['all', 'available', 'token', 'booked', 'sold'].map(status => (
              <button
                 key={status}
                 onClick={() => setStatusFilter(status)}
                 className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                    statusFilter === status 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                 }`}
              >
                 {status}
              </button>
           ))}
        </div>

        <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-slate-200">
           {['sm', 'md', 'lg'].map(d => (
              <button
                 key={d}
                 onClick={() => setDensity(d)}
                 className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    density === d 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
                 }`}
              >
                 {d}
              </button>
           ))}
        </div>
      </div>

      {/* Statistics Matrices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-[11px] font-black tracking-widest uppercase mb-2 opacity-90">Total Available</h3>
            <div className="text-4xl font-black drop-shadow-md">{availableCount}</div>
         </div>
         <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-[11px] font-black tracking-widest uppercase mb-2 opacity-90">Total Token</h3>
            <div className="text-4xl font-black drop-shadow-md">{tokenCount}</div>
         </div>
         <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 shadow-xl shadow-amber-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-[11px] font-black tracking-widest uppercase mb-2 opacity-90">Total Booked</h3>
            <div className="text-4xl font-black drop-shadow-md">{bookedCount}</div>
         </div>
         <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 shadow-xl shadow-rose-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-all">
            <div className="absolute right-[-20%] top-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-[11px] font-black tracking-widest uppercase mb-2 opacity-90">Total Sold</h3>
            <div className="text-4xl font-black drop-shadow-md">{soldCount}</div>
         </div>
      </div>

      {/* Map Grid */}
      <div className={`grid ${densityClasses[density]} transition-all duration-500`}>
         {loading ? (
             <div className="col-span-full py-10 text-center text-blue-500 font-bold animate-pulse">Loading map data...</div>
         ) : (
            <>
               {filteredData.length === 0 && (
                 <div className="col-span-full py-20">
                    <EmptyState 
                      title="No Inventory Signatures" 
                      description="The project map is currently void of any plot or shop identities for this selection."
                      icon={Bookmark}
                      action={{
                        label: "Refresh Project Matrix",
                        onClick: fetchData
                      }}
                    />
                 </div>
               )}
               {filteredData.map((item) => {
             // Dynamic Image Matching
             let imageUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80"; // Default Land/Plot
             const lowerName = item.name.toLowerCase();
             if (lowerName.includes('villa')) imageUrl = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80";
             else if (lowerName.includes('shop')) imageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80";

             // Premium Gradient Mapping for Glass overlay
             let bgOverlayClass = "from-emerald-900 to-emerald-600 border-emerald-500/30 text-emerald-50"; 
             if (item.status === 'token') bgOverlayClass = "from-indigo-900 to-indigo-600 border-indigo-500/30 text-indigo-50"; 
             else if (item.status === 'booked') bgOverlayClass = "from-amber-900 to-amber-600 border-amber-500/30 text-amber-50"; 
             else if (item.status === 'sold') bgOverlayClass = "from-rose-900 to-rose-700 border-rose-500/30 text-rose-50"; 

             const isAvailable = item.status === 'available';

              return (
                  <div 
                    key={item.id} 
                    onClick={() => openModal('Property Forensic Dossier', <PropertyDossier plot={item} />)}
                    className={`rounded-2xl relative transition-all duration-300 hover:scale-[1.05] hover:z-[99] hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-xl bg-slate-900`}
                  >
                     {/* Inner wrapper for background and clipping to prevent dropdown from getting clipped */}
                     <div className="absolute inset-0 rounded-2xl overflow-hidden z-0 shadow-inner">
                        {/* Dynamic Background Image */}
                        <img src={imageUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${bgOverlayClass} opacity-[0.85] mix-blend-multiply pointer-events-none`} />
                        {/* Glass flare effect */}
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-white/10 rotate-45 transform -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                     </div>
 
                     <div className={`relative z-10 flex flex-col justify-between h-full border border-white/10 rounded-2xl ${density === 'sm' ? 'p-3 min-h-[110px]' : 'p-5 min-h-[170px]'}`}>
                         <div className="pr-2">
                             <div className={`${density === 'sm' ? 'text-[14px]' : 'text-[18px]'} font-black leading-tight mb-1 drop-shadow-md tracking-tight text-white line-clamp-2`}>{item.name}</div>
                             <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 truncate text-white/90">
                                {item.owner ? `Owner: ${item.owner}` : 'Available'}
                             </div>
                             {density !== 'sm' && (
                                <>
                                  <div className="text-[13px] font-bold opacity-90 mb-0.5 text-white">{item.marla}</div>
                                  <div className="text-[11px] font-semibold opacity-75 text-white">{item.dimensions}</div>
                                </>
                             )}
                         </div>
     
                         <div className="mt-4 flex justify-between items-end">
                            <div className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg backdrop-blur-md border shadow-inner ${
                               item.status === 'available' ? 'bg-emerald-500/30 text-emerald-50 border-emerald-400/30' :
                               item.status === 'sold' ? 'bg-rose-500/30 text-rose-50 border-rose-400/30' :
                               'bg-white/20 text-white border-white/10'
                            }`}>
                                {item.status}
                            </div>
                            
                            {/* Dropdown Menu (Only for Available) */}
                            {isAvailable && (
                                <div className="dropdown-container relative block">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === item.id ? null : item.id); }}
                                      className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors border border-white/10 shadow-sm"
                                      title="Open Options"
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                    
                                    {activeDropdown === item.id && (
                                        <div className="absolute z-[9999] right-0 bottom-full mb-2 w-52 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] py-2 text-slate-700 border border-slate-200/50 animate-in fade-in slide-in-from-bottom-2">
                                            <button 
                                               onClick={(e) => { e.stopPropagation(); openModal('Edit Plot/Shop', <PlotForm editData={item} onRefresh={fetchData} />); }}
                                               className="w-full text-left px-4 py-2.5 text-[12px] font-bold hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                                            >
                                               <Edit2 size={14} className="stroke-[2.5]" /> Edit Details
                                            </button>
                                            <button 
                                               onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                               className="w-full text-left px-4 py-2.5 text-[12px] font-bold hover:bg-rose-50 hover:text-rose-600 flex items-center gap-3 transition-colors"
                                            >
                                               <Trash2 size={14} className="stroke-[2.5]" /> Remove
                                            </button>
                                            <div className="h-px bg-slate-100 my-1 mx-2" />
                                            <button 
                                               onClick={(e) => { e.stopPropagation(); navigate(`/tokens/new?plot=${item.id}`); }}
                                               className="w-full text-left px-4 py-2.5 text-[12px] font-bold hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                                            >
                                               <FileText size={14} className="stroke-[2.5]" /> Issue Token
                                            </button>
                                            <button 
                                               onClick={(e) => { e.stopPropagation(); navigate(`/bookings/new?plot=${item.id}`); }}
                                               className="w-full text-left px-4 py-2.5 text-[12px] font-bold hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-3 transition-colors"
                                            >
                                               <Bookmark size={14} className="stroke-[2.5]" /> Secure Booking
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                         </div>
                     </div>
                  </div>
              );
          })}
            </>
         )}
      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchData} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999] fixed bottom-48 right-3 flex items-center justify-center w-12 h-12 rounded-full hover:scale-105 transition-transform"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchData} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999] fixed bottom-32 right-3 flex items-center justify-center w-12 h-12 rounded-full hover:scale-105 transition-transform"
        style={{ backgroundColor: '#ffc107' }}
        title="Transfer"
      >
        <Send size={24} />
      </button>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-slate-500 text-[10px] border-t border-slate-200 bg-white/50">
          COPYRIGHT &copy; 2026 | ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default MapPage;
