import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useModal } from '../Modal';
import { DollarSign, FileText, Calendar, User, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const paymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  account_id: z.string().min(1, 'Account is required'),
  type: z.enum(['debit', 'credit']),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  customer_id: z.string().optional(),
  description: z.string().min(3, 'Detailed description is required'),
  category: z.string().default('Operating')
});

const PaymentForm = ({ onRefresh, initialType = 'expense' }) => {
  const { closeModal } = useModal();
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: initialType === 'income' ? 'credit' : 'debit',
      category: 'Operating',
      customer_id: '',
      account_id: ''
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [accRes, custRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/customers-list') 
        ]);
        setAccounts(accRes.data);
        setCustomers(custRes.data);
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };
    loadData();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        debit: data.type === 'debit' ? data.amount : 0,
        credit: data.type === 'credit' ? data.amount : 0,
        account_id: parseInt(data.account_id)
      };
      await api.post('/payments', payload);
      closeModal();
      if (onRefresh) onRefresh();
      toast.success('Payment recorded successfully');
    } catch (err) {
      console.error('Error saving payment:', err);
      toast.error(err.response?.data?.error || 'Error saving payment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="date"
              {...register('date')}
              className={`w-full bg-slate-50 border rounded-lg pl-10 pr-3 py-2 text-[13px] focus:ring-2 focus:ring-blue-500/20 ${errors.date ? 'border-red-400' : 'border-slate-200'}`}
            />
          </div>
          {errors.date && <p className="text-[10px] text-red-500 mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase">Transaction Type</label>
          <select 
            {...register('type')}
            className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-[13px] focus:ring-2 focus:ring-blue-500/20 ${errors.type ? 'border-red-400' : 'border-slate-200'}`}
          >
            <option value="debit">Spending (Debit)</option>
            <option value="credit">Receiving (Credit)</option>
          </select>
          {errors.type && <p className="text-[10px] text-red-500 mt-1">{errors.type.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase">Select Account</label>
        <select 
          {...register('account_id')}
          className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-[13px] focus:ring-2 focus:ring-blue-500/20 ${errors.account_id ? 'border-red-400' : 'border-slate-200'}`}
        >
          <option value="">-- Choose Account --</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
          ))}
        </select>
        {errors.account_id && <p className="text-[10px] text-red-500 mt-1">{errors.account_id.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase">Amount (Rs.)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="number" step="0.01"
              {...register('amount')}
              className={`w-full bg-slate-50 border rounded-lg pl-10 pr-3 py-2 text-[13px] font-bold text-slate-800 ${errors.amount ? 'border-red-400' : 'border-slate-200'}`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-[10px] text-red-500 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase">Customer (Optional)</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <select 
              {...register('customer_id')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-[13px]"
            >
              <option value="">-- No Customer --</option>
              {customers.map(cust => (
                <option key={cust.id} value={cust.id}>{cust.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase">Description / Narration</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
          <textarea 
            rows="3"
            {...register('description')}
            className={`w-full bg-slate-50 border rounded-lg pl-10 pr-3 py-2 text-[13px] ${errors.description ? 'border-red-400' : 'border-slate-200'}`}
            placeholder="What was this payment for?"
          />
        </div>
        {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div className="pt-2">
        <button 
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : (
            <>
              <span>Post Transaction</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
