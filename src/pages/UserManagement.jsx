import React, { useState, useEffect } from 'react';
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
  User,
  Shield,
  HelpCircle,
  Check,
  XCircle,
  FileText
} from 'lucide-react';

import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import UserForm from '../components/forms/UserForm';
import SkeletonTable from '../components/SkeletonTable';
import TransferForm from '../components/forms/TransferForm';
import { toast } from 'react-hot-toast';
import { generateStrategicPDF } from '../utils/reportUtils';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'locked'

  useEffect(() => {
    document.title = "User Management | Real Estate";
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
     
  }, []);

  const fetchUsers = async (signal) => {
    try {
      const res = await api.get('/users', { signal });
      if (!signal?.aborted) {
        // Server returns { data: [], pagination: {} }
        setUsers(Array.isArray(res.data) ? res.data : (res.data.data ?? []));
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error(err);
        setUsers([]);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  const { openModal } = useModal();

  const handleStatusToggle = async (id) => {
    try {
      await api.put(`/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 1 ? 0 : 1 } : u));
      toast.success('Status updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };
 
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success('User deleted successfully');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && u.status === 1) ||
      (statusFilter === 'locked' && u.status === 0);
      
    return matchesSearch && matchesStatus;
  });

  const handleExportPDF = () => {
    const headers = ['Staff ID', 'Full Name', 'Role/Shield', 'Email Contact', 'Status'];
    const body = filteredUsers.map(u => [
      `STAFF-${u.id.toString().padStart(4, '0')}`,
      u.name.toUpperCase(),
      u.role.toUpperCase(),
      u.email,
      u.status === 1 ? 'ACTIVE' : 'LOCKED'
    ]);

    generateStrategicPDF({
      title: 'Staff Directory Security Audit',
      subtitle: `Status: ${statusFilter.toUpperCase()} | Onboarded Headcount: ${filteredUsers.length} | Generated: ${new Date().toLocaleDateString()}`,
      headers,
      body,
      filename: `staff_audit_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Settings</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">Users</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-tight uppercase tracking-tight">Staff Orchestration</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Regional Administrative Directory</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <FileText size={16} className="stroke-[3]" /> 
            <span>Strategic Export</span>
          </button>
          <button 
            onClick={() => openModal('Onboard Staff Member', <UserForm onRefresh={fetchUsers} />)}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-5 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={16} className="stroke-[3]" /> 
            <span>Onboard Member</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
          {[
            { id: 'all', label: 'All Staff' },
            { id: 'active', label: 'Active' },
            { id: 'locked', label: 'Locked' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Section */}
        <div className="relative max-w-xs w-full">
           <input 
              type="text"
              placeholder="Search users..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-bold text-slate-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <SkeletonTable rows={8} columns={6} />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider text-center">Role</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider text-center">Help</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium italic">No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/10 transition-colors last:border-0 text-slate-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-xl transition-transform hover:scale-110 duration-300 relative group">
                           <img 
                             src={`https://i.pravatar.cc/150?u=ittehad_staff_${u.id}`} 
                             alt={u.name} 
                             className="w-full h-full object-cover"
                           />
                           {u.status === 1 && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[13px] font-black text-slate-800 hover:text-indigo-600 cursor-pointer transition-colors leading-none mb-1 uppercase tracking-tight">{u.name}</span>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: STAFF-{u.id.toString().padStart(4, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tight">
                        <Shield size={10} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-700">{u.email}</span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-tight">PH: {u.mobile_no || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-[12px] font-mono font-bold text-slate-500">
                      {u.help || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleStatusToggle(u.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                          u.status === 1 
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        }`}
                      >
                         {u.status === 1 ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-red-600" />}
                         {u.status === 1 ? 'Active' : 'Locked'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openModal(`Edit: ${u.name}`, <UserForm editData={u} onRefresh={fetchUsers} />)}
                          className="text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 p-2 rounded-lg border border-blue-100 shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-2 rounded-lg border border-red-100 shadow-sm hover:shadow-md"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchUsers} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchUsers} />)}
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

export default UserManagement;
