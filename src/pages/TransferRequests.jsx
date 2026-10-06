import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SkeletonTable from '../components/SkeletonTable';
import api from '../lib/api';
import { 
  Search, 
  CheckCircle, 
  XCircle,
  CreditCard,
  Send,
  Calendar,
  User,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';

const TransferRequests = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = "Transfer Requests | Real Estate";
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transfer-requests');
      setData(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this transfer request?')) {
      try {
        await api.post(`/transfer-requests/approve/${id}`);
        fetchData();
        toast.success('Transfer approved successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to approve transfer');
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this transfer request?')) {
      try {
        await api.post(`/transfer-requests/reject/${id}`);
        fetchData();
        toast.success('Transfer rejected successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to reject transfer');
      }
    }
  };

  const { openModal } = useModal();

  const filteredData = data.filter(item => 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.from_account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.to_account?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-indigo-600 transition-colors">Transfers</a>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Request Queue</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Transfer Requests</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Asset Relocation Verification Portal</p>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-[-20%] right-[-5%] opacity-10 text-white transform -rotate-12">
             <ShieldCheck size={280} strokeWidth={1} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
             <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse-slow">
                <Send size={28} strokeWidth={3} />
             </div>
             <div>
                <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight">Liquidity Transit</h2>
                <div className="flex items-center gap-2 mt-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.length} Internal Relocations Awaiting Approval</span>
                </div>
             </div>
          </div>
      </div>

      {/* Global Search */}
      <div className="mb-6 flex justify-end">
        <div className="relative max-w-sm w-full group">
           <input 
              type="text"
              placeholder="Search Request Queue..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-bold text-slate-600 placeholder:text-slate-300 transition-all focus:border-indigo-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
              <Search size={18} strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Zap size={20} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Relocation Staging</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Asset Management Vault</span>
               </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <SkeletonTable rows={8} columns={7} />
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-[120px]">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Origin</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Destination</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right w-[140px]">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center w-[120px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-black font-mono">
                        {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-black text-indigo-600 hover:underline cursor-pointer decoration-2 underline-offset-4">
                        {item.from_account}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[14px] font-black text-emerald-600 hover:underline cursor-pointer decoration-2 underline-offset-4">
                        {item.to_account}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-[14px] font-black text-slate-800 font-mono">
                        Rs. {(item.debit || item.credit || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all border border-emerald-100 shadow-sm"
                        >
                          <CheckCircle size={14} strokeWidth={3} /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all border border-rose-100 shadow-sm"
                        >
                          <XCircle size={14} strokeWidth={3} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-black italic uppercase tracking-widest opacity-50">
                       Transfer queue is synchronized. No pending relocations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchData} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} strokeWidth={3} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchData} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ffc107' }}
        title="Transfer"
      >
        <Send size={24} strokeWidth={3} />
      </button>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl mx-auto max-w-sm">
          ITTEHAD COMMERCIAL CENTRE &copy; 2026
      </footer>
    </div>
  );
};

export default TransferRequests;
