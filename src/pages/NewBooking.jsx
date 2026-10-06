import React, { useState, useEffect } from 'react';
import { CreditCard, Send, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';

const NewBooking = () => {
  const [bookingNo] = useState(`BKNO#${Math.floor(Date.now() / 1000)}`);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [showNextOfKin, setShowNextOfKin] = useState(false);
  const [bookingType, setBookingType] = useState('cash');
  const [payingBy, setPayingBy] = useState('cash');

  const [customers, setCustomers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [agents, setAgents] = useState([]);
  const [installmentTypes, setInstallmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openModal } = useModal();

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedInstallmentTypeId, setSelectedInstallmentTypeId] = useState('');
  const [newCustomerData, setNewCustomerData] = useState({
    name: '', relation_name: '', cnic: '', phone: '', address: '', cast: '', reference: '',
    next_of_kin_name: '', next_of_kin_phone: ''
  });

  const [ratePerUnit, setRatePerUnit] = useState('');
  const [discount, setDiscount] = useState('');
  const [advance, setAdvance] = useState('');
  const [advanceReceived, setAdvanceReceived] = useState('');
  const [noOfInstallments, setNoOfInstallments] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [bankName, setBankName] = useState('');
  const [transactionDetails, setTransactionDetails] = useState('');
  const [simulation, setSimulation] = useState([]);

  // Auto Calculations
  const totalAmount = Number(ratePerUnit || 0);
  const remainingAmount = Math.max(0, totalAmount - Number(discount || 0));
  const advanceRemaining = Math.max(0, Number(advance || 0) - Number(advanceReceived || 0));
  const totalPayable = remainingAmount;
  const installmentAmount = bookingType === 'installment' && noOfInstallments ? Math.round(remainingAmount / Number(noOfInstallments)) : 0;

  useEffect(() => {
    document.title = "New Booking | Real Estate";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, plotRes, instRes, agentRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/map'),
        api.get('/accounts?type=income'), 
        api.get('/agents')
      ]);
      setCustomers(custRes.data.data || custRes.data);
      setPlots(plotRes.data.filter(p => p.status === 'available'));
      setInstallmentTypes(instRes.data);
      setAgents(agentRes.data.data || agentRes.data || []);
      setLoading(false);
    } catch {
      console.error("Error fetching form data");
      setLoading(false);
    }
  };

  const handleNewCustomerChange = (e) => {
    setNewCustomerData({ ...newCustomerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let customerId = selectedCustomerId;
      let customerName = customers.find(c => c.id == selectedCustomerId)?.name || '';

      if (isNewCustomer) {
        const custRes = await api.post('/land-customers', newCustomerData);
        customerId = custRes.data.id;
        customerName = newCustomerData.name;
      }

      const bookingData = {
        date: new Date().toISOString().split('T')[0],
        customer_id: customerId,
        plot_id: selectedPlotId,
        rate: Number(ratePerUnit),
        total: totalAmount - Number(discount || 0),
        advance: Number(advanceReceived),
        installment_plan_months: bookingType === 'installment' ? Number(noOfInstallments) : 0,
        agent_id: selectedAgentId,
        description: description,
        customer_name: customerName,
        payment_method: payingBy,
        bank_name: bankName || null,
        transaction_details: transactionDetails || null
      };

      await api.post('/bookings', bookingData);
      
      toast.success('Booking saved successfully! Installment schedule generated.');
      window.location.href = '/sale/bookings';
    } catch {
      console.error("Error saving booking");
      toast.error('Error saving booking. Check backend logs.');
    } finally {
      setLoading(true); // Keep loading until redirect
    }
  };



  const handleSimulate = async () => {
    if (!noOfInstallments || !nextDueDate) return toast.error('Please enter installments and start date');
    try {
      const res = await api.post('/installments/simulate', {
        total_amount: totalAmount,
        advance: Number(advanceReceived || 0),
        discount: Number(discount || 0),
        months: Number(noOfInstallments),
        start_date: nextDueDate
      });
      setSimulation(res.data);
      if (res.data.length > 0) toast.success('Schedule preview generated');
    } catch {
      toast.error('Simulation failed.');
    }
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Booking</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">New Booking</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#333] leading-tight flex items-center gap-3">
           New Booking
           <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold border border-blue-200">
             {bookingNo}
           </span>
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10">
        <div className="border-b border-slate-100 px-8 py-5 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
          <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">Booking Registration Matrix</h2>
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
                     required={!isNewCustomer}
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
                         <label className="block text-[12px] font-semibold text-slate-600 mb-1">Customer Name</label>
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

          {/* Property & Agent Section */}
          <section className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
             <div className="flex items-center gap-3 mb-5 border-b border-indigo-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                   <ChevronDown size={18} className="stroke-[3]" />
                </div>
                <h3 className="text-[13px] font-black text-indigo-700 uppercase tracking-widest">Property & Agent Allocation</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Shop <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] font-medium text-slate-700"
                    value={selectedPlotId}
                    onChange={(e) => setSelectedPlotId(e.target.value)}
                  >
                    <option value="">Select Shop</option>
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.marla} ({p.dimensions})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Agent (Commission)</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] font-medium text-slate-700"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                  >
                    <option value="">Select Agent</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.commission_rate}%)</option>
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
                <h3 className="text-[13px] font-black text-amber-700 uppercase tracking-widest">Financial Blueprint</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 relative z-10">
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Rate per unit <span className="text-red-500">*</span></label>
                   <input type="number" required min="0" value={ratePerUnit} onChange={e => setRatePerUnit(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="0" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Total Amount</label>
                   <input type="number" readOnly value={totalAmount} className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-[13px] text-slate-500" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Discount</label>
                   <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="0" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Remaining Amount</label>
                   <input type="number" readOnly value={remainingAmount} className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-[13px] font-bold text-rose-600" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Advance</label>
                   <input type="number" min="0" value={advance} onChange={e => setAdvance(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="0" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Advance Received</label>
                   <input type="number" min="0" value={advanceReceived} onChange={e => setAdvanceReceived(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="0" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Advance Remaining</label>
                   <input type="number" readOnly value={advanceRemaining} className="w-full bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-[13px] font-bold text-amber-600" />
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Advance Due Date</label>
                   <input type="date" className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" />
                </div>
             </div>
          </section>

          {/* Booking Plan Section */}
          <section>
             <h3 className="text-[13px] font-bold text-[#5D78FF] mb-4 pb-2 border-b border-blue-100">Booking Plan</h3>
             
             <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer touch-none">
                   <input type="radio" name="bookingType" value="cash" checked={bookingType === 'cash'} onChange={() => setBookingType('cash')} className="w-4 h-4 text-blue-600" />
                   <span className="text-[13px] font-bold text-slate-700">Cash</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer touch-none">
                   <input type="radio" name="bookingType" value="installment" checked={bookingType === 'installment'} onChange={() => setBookingType('installment')} className="w-4 h-4 text-blue-600" />
                   <span className="text-[13px] font-bold text-slate-700">Installments</span>
                </label>
             </div>

             {bookingType === 'installment' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 p-5 bg-slate-50 border border-slate-200 rounded-lg">
                   <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Installment Type <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]"
                        value={selectedInstallmentTypeId}
                        onChange={(e) => setSelectedInstallmentTypeId(e.target.value)}
                      >
                         <option value="">Select Type</option>
                         {installmentTypes.map(it => (
                            <option key={it.id} value={it.id}>{it.name}</option>
                         ))}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">No. of Installments <span className="text-red-500">*</span></label>
                      <input type="number" required min="1" value={noOfInstallments} onChange={e => setNoOfInstallments(e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="1" />
                   </div>
                   <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Installment Amount</label>
                      <input type="number" readOnly value={installmentAmount} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] font-bold text-[#5D78FF]" />
                   </div>
                   <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Next Date <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        required 
                        className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" 
                        value={nextDueDate}
                        onChange={(e) => setNextDueDate(e.target.value)}
                      />
                   </div>
                   <div className="md:col-span-4 mt-2">
                       <button type="button" onClick={handleSimulate} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-100 w-full hover:bg-indigo-100 transition-colors">
                          Simulate Schedule Plan
                       </button>
                   </div>
                </div>
             )}

             {simulation.length > 0 && bookingType === 'installment' && (
                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm max-h-60 overflow-y-auto">
                    <h4 className="text-xs font-black uppercase text-slate-500 mb-3 border-b pb-2">SIMULATED SCHEDULE</h4>
                    <table className="w-full text-left text-xs">
                       <thead>
                          <tr className="text-slate-400">
                             <th className="py-2">Month</th>
                             <th>Due Date</th>
                             <th className="text-right">Amount</th>
                          </tr>
                       </thead>
                       <tbody>
                          {simulation.map((s, i) => (
                             <tr key={i} className="border-t border-slate-50">
                               <td className="py-2 font-bold text-slate-700">{s.month}</td>
                               <td className="text-slate-600">{new Date(s.due_date).toLocaleDateString()}</td>
                               <td className="text-right font-black text-emerald-600">Rs. {s.amount.toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                </div>
             )}
          </section>

          {/* Payment Section */}
          <section className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white">
             <div className="flex items-center gap-3 mb-6 border-b border-emerald-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                   <CreditCard size={18} className="stroke-[3]" />
                </div>
                <h3 className="text-[13px] font-black text-emerald-700 uppercase tracking-widest">Final Transaction Details</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-1">
                   <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Total Payable Assessment</label>
                   <input type="text" readOnly value={`Rs. ${totalPayable.toLocaleString()}`} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-none rounded-xl px-5 py-4 text-2xl font-black text-center touch-none outline-none" />
                </div>
                
                <div className="md:col-span-2">
                   <label className="block text-[12px] font-semibold text-slate-600 mb-1">Paying By <span className="text-red-500">*</span></label>
                   <select 
                     required 
                     className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px]"
                     value={payingBy}
                     onChange={(e) => setPayingBy(e.target.value)}
                   >
                     <option value="cash">Cash</option>
                     <option value="cheque">Cheque</option>
                     <option value="online">Online</option>
                   </select>
                </div>
             </div>

             {payingBy !== 'cash' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-amber-50/50 border border-amber-100 rounded-lg">
                   <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Bank Name</label>
                      <input type="text" className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                   </div>
                   <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1">Cheque # / Account No. / TID #</label>
                      <input type="text" className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" placeholder="Transaction Details" value={transactionDetails} onChange={(e) => setTransactionDetails(e.target.value)} />
                   </div>
                </div>
             )}

             <div className="mt-5">
                <label className="block text-[12px] font-semibold text-slate-600 mb-1">Description</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px]" 
                  rows={3} 
                  placeholder="Additional Notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
             </div>
          </section>

          {/* Action Buttons */}
          <div className="border-t border-slate-100 pt-8 mt-4 flex justify-end gap-4 px-2">
             <button type="button" className="px-8 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm active:scale-95">
                 Cancel Submission
             </button>
             <button type="submit" disabled={loading} className="px-10 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-xl shadow-indigo-500/30 transition-transform active:scale-95 hover:-translate-y-1 group flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                 <span>{loading ? 'Processing...' : 'Authorize & Save'}</span>
                 <Send size={14} className="stroke-[3] group-hover:translate-x-1 transition-transform" />
             </button>
          </div>

        </form>
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

export default NewBooking;
