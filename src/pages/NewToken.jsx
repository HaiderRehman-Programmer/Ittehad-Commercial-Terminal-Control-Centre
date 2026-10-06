import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Send, Plus, Search, ChevronDown, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const NewToken = () => {
  const navigate = useNavigate();
  const [tokenNo] = useState(() => `TKN#${Math.floor(Date.now() / 1000)}`);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [showNextOfKin, setShowNextOfKin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data state
  const [customers, setCustomers] = useState([]);
  const [plots, setPlots] = useState([]);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [newCustomerData, setNewCustomerData] = useState({
    name: '', relation_name: '', cnic: '', phone: '', address: '', cast: '', reference: '',
    next_of_kin_name: '', next_of_kin_phone: ''
  });

  const [ratePerUnit, setRatePerUnit] = useState('');
  const [tokenAmountPaid, setTokenAmountPaid] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Auto Calculations
  const totalAmount = Number(ratePerUnit || 0);
  const remainingAmount = Math.max(0, totalAmount - Number(tokenAmountPaid || 0));

  const fetchData = useCallback(async () => {
    try {
      const [custRes, plotRes] = await Promise.all([
        api.get('/customers-list'),
        api.get('/map')
      ]);
      setCustomers(Array.isArray(custRes.data) ? custRes.data : custRes.data.data || []);
      setPlots(plotRes.data.filter(p => p.status === 'available'));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching form data", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    document.title = "New Token | Real Estate";
    
    const init = async () => {
      await fetchData();
      if (!isMounted) return;
    };
    
    init();
    
    return () => { isMounted = false; };
  }, [fetchData]);


  const handleNewCustomerChange = (e) => {
    setNewCustomerData({ ...newCustomerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlotId) return toast.error('Please select a property/shop');
    if (!ratePerUnit) return toast.error('Please enter the rate');
    
    setLoading(true);
    try {
      let customerName = '';

      if (isNewCustomer) {
        if (!newCustomerData.name || !newCustomerData.phone || !newCustomerData.cnic) {
          toast.error("Please fill Name, Phone and CNIC for new customer");
          setLoading(false);
          return;
        }
        await api.post('/customers', newCustomerData);
        customerName = newCustomerData.name;
      } else {
        if (!selectedCustomerId) {
          toast.error('Please select an existing customer');
          setLoading(false);
          return;
        }
        customerName = customers.find(c => String(c.id) === String(selectedCustomerId))?.name || '';
      }

      const tokenData = {
        plot_id: selectedPlotId,
        customer_name: customerName,
        rate: Number(ratePerUnit),
        total_amount: totalAmount,
        token_amount: Number(tokenAmountPaid),
        remaining: remainingAmount,
        due_date: dueDate
      };

      await api.post('/tokens', tokenData);
      
      toast.success('Token created successfully!');
      navigate('/sale/tokens');
    } catch {
      console.error("Error saving token");
      toast.error('Error saving token. Check backend logs.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <span onClick={() => navigate('/sale/tokens')} className="cursor-pointer hover:text-[#5D78FF] transition-colors">Tokens</span>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">New Token</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#333] leading-tight flex items-center gap-3">
           New Token Allocation
           <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-bold border border-indigo-200">
             {tokenNo}
           </span>
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
        <div className="border-b border-slate-100 px-8 py-5 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
          <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Token Registration Matrix</h2>
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-slate-100"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">

          {/* Customer Selection Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />
             <div className="flex items-center gap-3 mb-6 border-b border-indigo-100 pb-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                   <Search size={18} className="stroke-[3]" />
                </div>
                <h3 className="text-[13px] font-black text-indigo-700 uppercase tracking-widest">Client Identification</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div>
                   <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Customer Already Exists?</label>
                   <select 
                     className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5D78FF]"
                     disabled={isNewCustomer}
                     value={selectedCustomerId}
                     onChange={(e) => setSelectedCustomerId(e.target.value)}
                   >
                     <option value="">Select Existing Customer</option>
                     {customers.map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                   </select>
                </div>
                
                <div className="flex items-end">
                   <button 
                     type="button" 
                     onClick={() => setIsNewCustomer(!isNewCustomer)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-bold transition-colors w-full justify-center md:justify-start md:w-auto
                        ${isNewCustomer ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                   >
                     {isNewCustomer ? 'Cancel New Customer' : <><Plus size={16} /> Add New Customer</>}
                   </button>
                </div>
             </div>

             {/* New Customer Wrapper */}
             {isNewCustomer && (
                <div className="mt-6 p-5 border border-dashed border-blue-200 bg-blue-50/30 rounded-lg space-y-5">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                         <label className="block text-[12px] font-semibold text-slate-600 mb-1">Customer Name <span className="text-red-500">*</span></label>
                         <input type="text" name="name" value={newCustomerData.name} onChange={handleNewCustomerChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Full Name" />
                      </div>
                      <div>
                         <label className="block text-[12px] font-semibold text-slate-600 mb-1">S/O, D/O, M/O</label>
                         <input type="text" name="relation_name" value={newCustomerData.relation_name} onChange={handleNewCustomerChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Guardian/Relation" />
                      </div>
                      <div>
                         <label className="block text-[12px] font-semibold text-slate-600 mb-1">CNIC <span className="text-red-500">*</span></label>
                         <input type="text" name="cnic" value={newCustomerData.cnic} onChange={handleNewCustomerChange} required={isNewCustomer} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="00000-0000000-0" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                         <label className="block text-[12px] font-semibold text-slate-600 mb-1">Phone <span className="text-red-500">*</span></label>
                         <input type="text" name="phone" value={newCustomerData.phone} onChange={handleNewCustomerChange} required={isNewCustomer} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Phone Number" />
                      </div>
                      <div>
                         <label className="block text-[12px] font-semibold text-slate-600 mb-1">Cast</label>
                         <input type="text" name="cast" value={newCustomerData.cast} onChange={handleNewCustomerChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Cast" />
                      </div>
                      <div>
                         <label className="block text-[12px] font-semibold text-slate-600 mb-1">Reference</label>
                         <input type="text" name="reference" value={newCustomerData.reference} onChange={handleNewCustomerChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Reference" />
                      </div>
                   </div>

                   <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Address</label>
                      <input type="text" name="address" value={newCustomerData.address} onChange={handleNewCustomerChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Full Address" />
                   </div>

                   {/* Next of Kin Toggle */}
                   <div className="mt-3">
                      <button type="button" onClick={() => setShowNextOfKin(!showNextOfKin)} className="text-xs font-bold text-indigo-600 underline underline-offset-4 hover:text-indigo-800 transition-colors">
                        {showNextOfKin ? 'Hide Next of Kin Details' : '+ Add Next of Kin Details'}
                      </button>
                      {showNextOfKin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3 p-4 bg-indigo-50/30 border border-dashed border-indigo-200 rounded-lg">
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-600 mb-1">Next of Kin Name</label>
                            <input type="text" name="next_of_kin_name" value={newCustomerData.next_of_kin_name} onChange={handleNewCustomerChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Full Name" />
                          </div>
                          <div>
                            <label className="block text-[12px] font-semibold text-slate-600 mb-1">Next of Kin Phone</label>
                            <input type="text" name="next_of_kin_phone" value={newCustomerData.next_of_kin_phone} onChange={handleNewCustomerChange} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Phone Number" />
                          </div>
                        </div>
                      )}
                   </div>
                </div>
             )}
          </section>

          {/* Property Section */}
          <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
             <div className="flex items-center gap-3 mb-5 border-b border-indigo-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                   <ChevronDown size={18} className="stroke-[3]" />
                </div>
                <h3 className="text-[13px] font-black text-indigo-700 uppercase tracking-widest">Property Assignment</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Property/Shop <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] font-medium text-slate-700"
                    value={selectedPlotId}
                    onChange={(e) => setSelectedPlotId(e.target.value)}
                  >
                    <option value="">Select Available Property</option>
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.marla} ({p.dimensions}) - Rs. {(Number(p.price)||0).toLocaleString()}</option>
                    ))}
                  </select>
                </div>
             </div>
          </section>

          {/* Financials Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full blur-2xl pointer-events-none" />
             <div className="flex items-center gap-3 mb-6 border-b border-amber-100 pb-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                   <CreditCard size={18} className="stroke-[3]" />
                </div>
                <h3 className="text-[13px] font-black text-amber-700 uppercase tracking-widest">Token Financials</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Rate / Final Price <span className="text-red-500">*</span></label>
                   <input type="number" required min="0" value={ratePerUnit} onChange={e => setRatePerUnit(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="0" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Total Assessment</label>
                   <input type="text" readOnly value={`Rs. ${totalAmount.toLocaleString()}`} className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-500 font-bold" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Token Amount Received <span className="text-red-500">*</span></label>
                   <input type="number" required min="0" value={tokenAmountPaid} onChange={e => setTokenAmountPaid(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px] border-emerald-400 bg-emerald-50/30 font-bold" placeholder="0" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Remaining Due</label>
                   <input type="text" readOnly value={`Rs. ${remainingAmount.toLocaleString()}`} className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-[13px] font-bold text-rose-600" />
                </div>
             </div>

             <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Due Date for Remaining</label>
                   <input 
                     type="date" 
                     className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" 
                     value={dueDate}
                     onChange={(e) => setDueDate(e.target.value)}
                   />
                </div>
             </div>
          </section>

          {/* Action Buttons */}
          <div className="border-t border-slate-100 pt-8 mt-4 flex justify-end gap-4 px-2">
             <button type="button" onClick={() => navigate('/sale/tokens')} className="px-8 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm active:scale-95">
                 Cancel Submission
             </button>
             <button type="submit" disabled={loading} className="px-10 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/30 transition-transform active:scale-95 hover:-translate-y-1 group flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <span>{loading ? 'Processing...' : 'Authorize & Issue Token'}</span>
                 <CheckCircle size={14} className="stroke-[3] group-hover:scale-110 transition-transform" />
             </button>
          </div>

        </form>
      </div>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-slate-500 text-[10px] border-t border-slate-200 bg-white/50">
          COPYRIGHT &copy; 2026 | ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default NewToken;
