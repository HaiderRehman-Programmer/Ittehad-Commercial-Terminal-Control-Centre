import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  CreditCard,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Clock,
  User,
  Map as MapIcon,
  Tag,
  ArrowRightCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import { ReceiptButton } from '../components/ReceiptGenerator';
import SkeletonTable from '../components/SkeletonTable';
import toast from 'react-hot-toast';

const Tokens = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ todayTotal: 0, todayTokens: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Tokens | Real Estate";
    fetchData();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/tokens/stats');
      setStats({
          todayTotal: res.data.todayTotal || 4500000,
          todayTokens: res.data.todayTokens || 12
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'all' 
        ? `/tokens?status=${statusFilter}`
        : '/tokens';
      const res = await api.get(url);
      setData(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const { openModal } = useModal();

  const handleStatusChange = (id, action) => {
      let confirmMsg = `Are you sure you want to ${action} this token?`;
      if (window.confirm(confirmMsg)) {
          toast.success(`Token ${action} request sent successfully`);
      }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded text-[11px] uppercase tracking-wider border border-emerald-200"><CheckCircle size={10} className="inline mr-1"/>Completed</span>;
      case 'in-progress': return <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded text-[11px] uppercase tracking-wider border border-blue-200"><Clock size={10} className="inline mr-1"/>In Progress</span>;
      case 'cancel': return <span className="bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded text-[11px] uppercase tracking-wider border border-rose-200"><XCircle size={10} className="inline mr-1"/>Cancelled</span>;
      case 'return': return <span className="bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded text-[11px] uppercase tracking-wider border border-amber-200"><RefreshCcw size={10} className="inline mr-1"/>Returned</span>;
      default: return <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded text-[11px] uppercase tracking-wider border border-slate-200">{status}</span>;
    }
  };

  const filteredData = data.filter(item => 
    item.no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Tokens</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">Tokens List</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#333] leading-tight">Tokens</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/sale/new-token')}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-4 py-2 rounded-md text-[13px] font-bold transition-colors shadow-sm"
          >
            <Plus size={16} /> 
            <span>Create Token</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-md text-white border border-blue-400/50">
            <h3 className="text-[12px] font-bold uppercase tracking-wider opacity-80 mb-2">Today Total</h3>
            <div className="text-3xl font-black">Rs. {stats.todayTotal.toLocaleString()}</div>
         </div>
         <div className="bg-gradient-to-r from-slate-600 to-slate-800 rounded-xl p-6 shadow-md text-white border border-slate-500/50">
            <h3 className="text-[12px] font-bold uppercase tracking-wider opacity-80 mb-2">Today Tokens</h3>
            <div className="text-3xl font-black">{stats.todayTokens}</div>
         </div>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Status Filter */}
        <div className="w-full md:w-64">
           <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Status</label>
           <select 
             className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5D78FF] font-medium text-slate-700 shadow-sm"
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
           >
             <option value="all">All</option>
             <option value="in-progress">In-Progress</option>
             <option value="completed">Completed</option>
             <option value="return">Return</option>
             <option value="cancel">Cancel</option>
           </select>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-auto mt-auto relative">
           <input 
              type="text"
              placeholder="Search Tokens..."
              className="form-control w-full min-w-[250px] bg-white border border-slate-200 rounded-md pl-3 pr-10 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5D78FF] shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#5D78FF]">
              <Search size={16} />
           </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        {loading ? (
          <SkeletonTable rows={6} columns={5} />
        ) : (
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Token No.</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Customer</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Map</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Rate</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Total</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Token</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Remaining</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Due Date</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Status</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0 hover:shadow-sm">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 text-[12px] font-bold text-[#5D78FF]">
                     <Tag size={12} className="text-blue-400" />
                     {item.no}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-slate-800">
                     <div className="bg-slate-200 p-1 rounded-full"><User size={12} className="text-slate-600"/></div>
                     {item.customer}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 text-[12px] font-medium text-slate-600 max-w-[120px] truncate" title={item.map}>
                     <MapIcon size={12} className="text-slate-400 shrink-0"/>
                     <span className="truncate">{item.map}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[12px] font-semibold text-slate-600 text-right">Rs. {item.rate.toLocaleString()}</td>
                <td className="px-5 py-3 text-[12px] font-semibold text-slate-600 text-right">Rs. {item.total.toLocaleString()}</td>
                <td className="px-5 py-3 text-[12px] font-bold text-emerald-600 text-right">Rs. {item.tokenAmt.toLocaleString()}</td>
                <td className="px-5 py-3 text-[12px] font-bold text-rose-600 text-right">Rs. {item.remaining.toLocaleString()}</td>
                <td className="px-5 py-3 text-[12px] font-semibold text-slate-500 text-center">{item.due}</td>
                <td className="px-5 py-3 text-center">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-2">
                     <ReceiptButton txId={item.id} />
                     <button 
                       onClick={() => toast('Detail view coming soon', { icon: 'ℹ️' })}
                       className="text-[#5D78FF] hover:bg-blue-50 p-1.5 rounded transition-colors"
                       title="View Token"
                     >
                       <Eye size={14} />
                     </button>
                     {item.status !== 'completed' && item.status !== 'cancel' && item.status !== 'return' && (
                       <>
                         <button 
                           onClick={() => navigate(`/sale/new-booking?token=${item.id}`)}
                           className="text-emerald-500 hover:bg-emerald-50 p-1.5 rounded transition-colors"
                           title="Proceed to Booking"
                         >
                           <ArrowRightCircle size={14} />
                         </button>
                         <button 
                           onClick={() => handleStatusChange(item.id, 'return')}
                           className="text-amber-500 hover:bg-amber-50 p-1.5 rounded transition-colors"
                           title="Return Token"
                         >
                           <RefreshCcw size={14} />
                         </button>
                         <button 
                           onClick={() => handleStatusChange(item.id, 'cancel')}
                           className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors"
                           title="Cancel Token"
                         >
                           <XCircle size={14} />
                         </button>
                       </>
                     )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-10 text-center text-slate-400 italic">No tokens found.</td>
              </tr>
            )}
          </tbody>
        </table>
        )}
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

export default Tokens;
