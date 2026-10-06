import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  User, 
  Calendar,
  Phone,
  CreditCard,
  Send,
  MapPin,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useModal } from '../components/Modal';
import VisitorForm from '../components/forms/VisitorForm';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
const Visitors = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    document.title = "Visitors | Real Estate";
    const controller = new AbortController();
    fetchData(1, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchData = async (page = 1, signal) => {
    setLoading(true);
    try {
      const res = await api.get(`/visitors?page=${page}&search=${searchTerm}`, { signal });
      if (!signal?.aborted) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(err);
        setData([]);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const { openModal } = useModal();

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Visitors</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">Visitors</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#333] leading-tight">Visitors</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => openModal('Add Visit', <VisitorForm onRefresh={fetchData} />)}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-4 py-2 rounded-md text-[13px] font-bold transition-colors shadow-sm"
          >
            <Plus size={16} /> 
            <span>Add Visit</span>
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="mb-6 flex justify-end">
        <div className="relative max-w-xs w-full">
           <input 
              type="text"
              placeholder="Search Visitors..."
              className="form-control w-full bg-white border border-slate-200 rounded-md pl-3 pr-10 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5D78FF] shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#5D78FF]">
              <Search size={16} />
           </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <SkeletonTable rows={10} columns={6} />
        ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider w-[120px]">Date</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">CNIC</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/10 transition-colors last:border-0 hover:shadow-sm">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    {item.date}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] font-bold text-[#5D78FF] flex items-center gap-2">
                    <User size={14} className="text-slate-400"/>
                    {item.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[13px] font-bold text-teal-600 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400"/>
                    {item.contact}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[13px] font-bold text-slate-700">
                    {item.cnic ? (
                      <div className="flex items-center gap-2">
                         <CreditCard size={14} className="text-slate-400"/>
                         {item.cnic}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic font-normal text-[12px]">- N/A -</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] font-medium text-slate-600">
                    {item.address ? (
                       <div className="flex items-center gap-2">
                         <MapPin size={14} className="text-slate-400"/>
                         {item.address}
                       </div>
                    ) : (
                       <span className="text-slate-400 italic">- N/A -</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-[12px] text-slate-600 italic leading-snug w-[300px]">
                  <div className="flex items-start gap-2">
                    <ClipboardList size={14} className="text-slate-400 mt-0.5 shrink-0"/>
                    <span className="truncate max-w-[250px]" title={item.description}>{item.description}</span>
                  </div>
                </td>
              </tr>
            ))}
             {data.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12">
                   <EmptyState 
                     title="No Visitor Signatures" 
                     description="The entrance ledger is currently void of any visitor logs matching your active search."
                     icon={User}
                     action={{
                       label: "Log First Visit",
                       onClick: () => openModal('Add Visit', <VisitorForm onRefresh={fetchData} />)
                     }}
                   />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
        
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50/10">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Showing {data.length} of {pagination.total} Visits
          </div>
          <div className="flex items-center gap-1">
            <button 
              disabled={pagination.page <= 1}
              onClick={() => fetchData(pagination.page - 1)}
              className="p-2 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-600"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1 mx-2">
              {[...Array(pagination.pages || 0)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => fetchData(i + 1)}
                  className={`w-8 h-8 rounded-md text-[12px] font-bold transition-all ${pagination.page === i + 1 ? 'bg-[#5D78FF] text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchData(pagination.page + 1)}
              className="p-2 rounded-md hover:bg-white disabled:opacity-30 transition-all text-slate-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchData} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchData} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999]"
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

export default Visitors;
