import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FileText, Search, Filter, RotateCcw, Plus, Edit2, Trash2, X, Calendar, UserPlus, Zap } from 'lucide-react';
import api from '../lib/api';
import { calculateRemaining, getBalanceStatus, formatPKR } from '../utils/financeUtils';
import { generateStrategicPDF } from '../utils/reportUtils';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
import { Users } from 'lucide-react';

const FinancialCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [dateType, setDateType] = useState('registration'); // registration or activity
  const [statusFilter, setStatusFilter] = useState('all'); // all, Clear, Partial, Overdue
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', acre: 0, kanal: 0, marla: 0,
    receivable: 0, received: 0, remaining: 0, short_amount: 0
  });

  async function fetchCustomers(page = 1) {
    setLoading(true);
    try {
      const res = await api.get(`/land-customers?page=${page}&search=${searchTerm}`);
      setCustomers(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
      if (res.data?.pagination) setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    if (name === 'receivable' || name === 'received') {
      const rec = name === 'receivable' ? value : formData.receivable;
      const paid = name === 'received' ? value : formData.received;
      newFormData.remaining = calculateRemaining(rec, paid);
    }
    
    setFormData(newFormData);
  };

  const openAddModal = () => {
    setFormData({
      name: '', phone: '', address: '', acre: 0, kanal: 0, marla: 0,
      receivable: 0, received: 0, remaining: 0, short_amount: 0
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setFormData({ ...customer });
    setCurrentCustomerId(customer.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/land-customers/${currentCustomerId}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/land-customers', formData);
        toast.success('Customer added successfully');
      }
      fetchCustomers(pagination.page);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Error saving customer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/land-customers/${id}`);
        toast.success('Customer deleted');
        fetchCustomers(pagination.page);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter(c => {
    const status = getBalanceStatus(c.receivable, c.received);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    // In a real app, date filtering would be handled by the API. 
    // For now, we'll implement the UI logic to support it.
    return matchesStatus;
  });

  const handleExportPDF = () => {
    const headers = ['ID', 'Customer Name', 'Contact Phone', 'Address', 'Receivable', 'Received', 'Balance', 'Status'];
    const body = filteredCustomers.map(c => [
      c.id.toString().padStart(4, '0'),
      c.name.toUpperCase(),
      c.phone,
      c.address || 'N/A',
      formatPKR(c.receivable || 0),
      formatPKR(c.received || 0),
      formatPKR(c.remaining || 0),
      getBalanceStatus(c.receivable, c.received).toUpperCase()
    ]);

    generateStrategicPDF({
      title: 'Financial Customers Audit',
      subtitle: `Filter: ${statusFilter !== 'all' ? statusFilter : 'All Balances'} | Date Mode: ${dateType.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`,
      headers,
      body,
      filename: `customers_financial_audit_${new Date().getTime()}.pdf`,
      orientation: 'landscape'
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    fetchCustomers(1);
  };

   return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Financial Directory</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Client Acquisition & Receivable Matrix</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <FileText size={18} className="stroke-[3]" /> 
            <span>Strategic Audit</span>
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
          >
            <UserPlus size={18} className="stroke-[3]" /> 
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
         <div className="flex flex-wrap items-end gap-6 relative z-10">
            <div className="min-w-[240px]">
               <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Temporal Intelligence Filter</label>
               <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button 
                    onClick={() => setDateType('registration')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                      dateType === 'registration' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <UserPlus size={14} strokeWidth={3} /> Registration
                  </button>
                  <button 
                    onClick={() => setDateType('activity')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                      dateType === 'activity' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Zap size={14} strokeWidth={3} /> Activity
                  </button>
               </div>
            </div>
            <div className="flex-1 min-w-[140px]">
               <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Fiscal Start</label>
               <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10" />
            </div>
            <div className="flex-1 min-w-[140px]">
               <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Fiscal End</label>
               <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10" />
            </div>
            <div className="flex-1 min-w-[200px]">
               <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest italic">Risk Classification</label>
               <select 
                 value={statusFilter}
                 onChange={e => setStatusFilter(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[12px] font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none uppercase tracking-widest"
               >
                 <option value="all">Display All Balances</option>
                 <option value="Clear">Paid / Clear (Zero Balance)</option>
                 <option value="Partial">Partial (Active Payments)</option>
                 <option value="Overdue">Overdue (No Payments)</option>
               </select>
            </div>
            <button onClick={handleReset} className="flex items-center justify-center w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-all active:scale-95" title="Reset Filters">
               <RotateCcw size={20} strokeWidth={3} />
            </button>
         </div>
      </div>

      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
               <Filter size={18} strokeWidth={3} />
            </div>
            <div>
               <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight leading-none">Intelligence Ledger</h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Sorted by Forensic Priority</span>
            </div>
         </div>
         
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 w-64 transition-all" 
            />
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Client Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Contact Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Receivable</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Liquidity (Paid)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Exposure (Remaining)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                     <SkeletonTable rows={5} columns={6} />
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                     <EmptyState 
                       title="Archive Void Detected" 
                       description="The intelligence matrix reports zero matches for your active filters."
                       icon={Users}
                       action={{
                         label: "Add First Client",
                         onClick: openAddModal
                       }}
                     />
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[14px] shadow-lg group-hover:scale-110 transition-transform">
                            {customer.name.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[14px] font-black text-slate-800 leading-none mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                               {customer.name}
                           </span>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID- {customer.id.toString().padStart(4, '0')}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-600 leading-none mb-1">{customer.phone}</span>
                          <span className="text-[9px] font-black text-slate-400 tracking-widest opacity-60 truncate max-w-[150px]">{customer.address || 'NO DOCUMENTED ADDRESS'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right text-[14px] font-black text-slate-800 font-mono italic opacity-40">
                       {formatPKR(customer.receivable || 0)}
                    </td>
                    <td className="px-6 py-5 text-right text-[14px] font-black text-emerald-600 font-mono">
                       {formatPKR(customer.received || 0)}
                    </td>
                    <td className="px-6 py-5 text-right font-mono">
                       <span className={`text-[15px] font-black px-3 py-1 rounded-xl ${customer.remaining > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {formatPKR(customer.remaining || 0)}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(customer)} 
                          className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center shadow-inner active:scale-95 border border-slate-100" 
                          title="Operational Edit"
                        >
                          <Edit2 size={16}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)} 
                          className="w-10 h-10 rounded-xl bg-rose-50 text-rose-300 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-inner active:scale-95 border border-rose-100" 
                          title="Permanently Expunge"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'flex-end', padding: '24px', gap: '8px', borderTop: '1px solid #e5e7eb'}}>
          <button 
            disabled={pagination.page <= 1}
            onClick={() => fetchCustomers(pagination.page - 1)}
            style={{color: pagination.page <= 1 ? '#9ca3af' : '#4b5563', backgroundColor: 'transparent', border: 'none', alignSelf: 'center', fontSize: '0.9rem', marginRight: '8px', cursor: pagination.page <= 1 ? 'default' : 'pointer'}}
          >
            Previous
          </button>
          
          {[...Array(pagination.pages)].map((_, i) => (
            <button 
              key={i}
              onClick={() => fetchCustomers(i + 1)}
              style={{
                width: '36px', height: '36px', 
                backgroundColor: pagination.page === i + 1 ? '#4f46e5' : '#f3f4f6', 
                border: '1px solid #e5e7eb', 
                borderRadius: '4px', 
                fontWeight: 'bold', 
                color: pagination.page === i + 1 ? 'white' : '#111827'
              }}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchCustomers(pagination.page + 1)}
            style={{color: pagination.page >= pagination.pages ? '#9ca3af' : '#4b5563', backgroundColor: 'transparent', border: 'none', alignSelf: 'center', fontSize: '0.9rem', marginLeft: '8px', cursor: pagination.page >= pagination.pages ? 'default' : 'pointer'}}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <h3>{isEditing ? 'Edit Customer' : 'Add Customer'}</h3>
              <X size={20} style={{cursor: 'pointer'}} onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="text" name="phone" className="form-input" required value={formData.phone} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" name="address" className="form-input" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Receivable</label>
                    <input type="number" name="receivable" className="form-input" value={formData.receivable} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Received</label>
                    <input type="number" name="received" className="form-input" value={formData.received} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Remaining</label>
                    <input type="number" name="remaining" className="form-input" value={formData.remaining} readOnly style={{backgroundColor: '#f3f4f6'}} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Short Amount</label>
                    <input type="number" name="short_amount" className="form-input" value={formData.short_amount} onChange={handleInputChange} />
                  </div>
                </div>
                <hr style={{margin: '12px 0 24px 0', border: 'none', borderTop: '1px solid #e5e7eb'}} />
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Acre</label>
                    <input type="number" name="acre" className="form-input" step="0.01" value={formData.acre} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kanal</label>
                    <input type="number" name="kanal" className="form-input" step="0.01" value={formData.kanal} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Marla</label>
                  <input type="number" name="marla" className="form-input" step="0.01" value={formData.marla} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialCustomers;
