import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useModal } from '../Modal';
import { Calendar, DollarSign, Wallet, FileText, CheckCircle } from 'lucide-react';

const InstallmentPaymentForm = ({ customerId, onRefresh }) => {
  const { closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    bookings: [],
    installments: [],
    accounts: []
  });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    installment_id: '',
    account_id: '8', // Default to Installment Income account based on db.js
    amount: '',
    description: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [bookingsRes, accountsRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/accounts')
        ]);
        
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data?.data || []);
        const customerBookings = bookings.filter(b => b.customer_id == customerId);
        setData(prev => ({ ...prev, bookings: customerBookings, accounts: Array.isArray(accountsRes.data) ? accountsRes.data : (accountsRes.data?.data || []) }));
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadInitialData();
  }, [customerId]);

  const handleBookingChange = async (bookingId) => {
    if (!bookingId) return;
    try {
      const res = await api.get(`/bookings/${bookingId}/installments`);
      const pending = res.data.filter(i => i.status === 'pending');
      setData(prev => ({ ...prev, installments: pending }));
    } catch (err) {
      console.error('Error loading installments:', err);
    }
  };

  const handleInstallmentChange = (instId) => {
     const inst = data.installments.find(i => i.id == instId);
     if (inst) {
        setFormData(prev => ({ 
           ...prev, 
           installment_id: instId, 
           amount: inst.amount,
           description: `Installment payment for Booking #${inst.booking_id} (Due: ${inst.due_date})`
        }));
     }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const booking = data.bookings[0]; 
      await api.post(`/installments/${formData.installment_id}/pay`, {
        ...formData,
        customer_id: customerId,
        plot_id: booking?.plot_id
      });
      closeModal();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error paying installment:', err);
      toast.error('Failed to process installment payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
           <Wallet size={20} />
        </div>
        <p className="text-[12px] text-emerald-800 font-bold leading-tight">
          Processing an installment will mark the schedule as 'paid' and automatically record income in your ledger.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="date" required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-[13px] font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Booking</label>
          <select 
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-800"
            onChange={(e) => handleBookingChange(e.target.value)}
          >
            <option value="">-- Choose Booking --</option>
            {data.bookings.map(b => (
              <option key={b.id} value={b.id}>{b.bookingNo || `BK#${b.id}`}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Installment Due</label>
        <select 
          required
          disabled={data.installments.length === 0}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-800 disabled:opacity-50"
          value={formData.installment_id}
          onChange={(e) => handleInstallmentChange(e.target.value)}
        >
          <option value="">-- Choose Installment --</option>
          {data.installments.map(i => (
            <option key={i.id} value={i.id}>Due: {i.due_date} - Rs. {i.amount.toLocaleString()}</option>
          ))}
        </select>
        {data.installments.length === 0 && (
           <p className="text-[10px] text-slate-400 mt-1 italic font-medium">* Select a booking first to see pending installments</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Collection Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="number" required readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-[13px] font-black text-emerald-600"
              value={formData.amount}
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Income Account</label>
          <select 
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-800"
            value={formData.account_id}
            onChange={(e) => setFormData({...formData, account_id: e.target.value})}
          >
            {data.accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
          <textarea 
            required rows="2"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-[13px] font-medium"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>

      <div className="pt-2">
        <button 
          disabled={loading || !formData.installment_id}
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (
            <>
              <CheckCircle size={20} />
              <span>Record Installment Payment</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InstallmentPaymentForm;
