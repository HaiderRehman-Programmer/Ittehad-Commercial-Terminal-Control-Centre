import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useModal } from '../Modal';
import { Send, DollarSign, Calendar, FileText, ArrowRightLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const transferSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  from_account_id: z.string().min(1, 'Source account is required'),
  to_account_id: z.string().min(1, 'Destination account is required'),
  amount: z.coerce.number().min(1, 'Amount must be at least 1'),
  description: z.string().min(3, 'Detailed description is required')
}).superRefine((data, ctx) => {
  if (data.from_account_id && data.to_account_id && data.from_account_id === data.to_account_id) {
    ctx.addIssue({
      path: ['to_account_id'],
      code: z.ZodIssueCode.custom,
      message: 'Source and Destination cannot be the same'
    });
  }
});

const TransferForm = ({ onRefresh }) => {
  const { closeModal } = useModal();
  const [accounts, setAccounts] = useState([]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      from_account_id: '',
      to_account_id: '',
      amount: '',
      description: ''
    }
  });

  const fromAccountId = watch('from_account_id');

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await api.get('/accounts');
        setAccounts(res.data);
      } catch (err) {
        console.error('Error loading accounts:', err);
      }
    };
    loadAccounts();
  }, []);

  const destinationAccounts = useMemo(() => {
    const fromId = parseInt(fromAccountId, 10);
    return accounts.filter(acc => acc.id !== fromId);
  }, [accounts, fromAccountId]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        from_account_id: parseInt(data.from_account_id),
        to_account_id: parseInt(data.to_account_id)
      };
      await api.post('/transfers', payload);
      closeModal();
      if (onRefresh) onRefresh();
      toast.success('Funds transferred successfully');
    } catch (err) {
      console.error('Error performing transfer:', err);
      toast.error(err.response?.data?.error || 'Error performing transfer. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
          <ArrowRightLeft size={20} />
        </div>
        <p className="text-[12px] text-amber-800 font-medium leading-tight">
          Internal transfers will debit the source account and credit the destination account automatically.
        </p>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="date"
            {...register('date')}
            className={`w-full bg-slate-50 border rounded-lg pl-10 pr-3 py-2 text-[13px] focus:ring-2 focus:ring-amber-500/20 ${errors.date ? 'border-red-400' : 'border-slate-200'}`}
          />
        </div>
        {errors.date && <p className="text-[10px] text-red-500 mt-1">{errors.date.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">From Account (Source)</label>
          <select 
            {...register('from_account_id')}
            className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-[13px] focus:ring-2 focus:ring-amber-500/20 ${errors.from_account_id ? 'border-red-400' : 'border-slate-200'}`}
          >
            <option value="">-- Select Source --</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
            ))}
          </select>
          {errors.from_account_id && <p className="text-[10px] text-red-500 mt-1">{errors.from_account_id.message}</p>}
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">To Account (Destination)</label>
          <select 
            {...register('to_account_id')}
            className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-[13px] focus:ring-2 focus:ring-amber-500/20 ${errors.to_account_id ? 'border-red-400' : 'border-slate-200'}`}
          >
            <option value="">-- Select Destination --</option>
            {destinationAccounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
            ))}
          </select>
          {errors.to_account_id && <p className="text-[10px] text-red-500 mt-1">{errors.to_account_id.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Amount (Rs.)</label>
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
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Reason / Description</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
          <textarea 
            rows="3"
            {...register('description')}
            className={`w-full bg-slate-50 border rounded-lg pl-10 pr-3 py-2 text-[13px] ${errors.description ? 'border-red-400' : 'border-slate-200'}`}
            placeholder="Why are you transferring these funds?"
          />
        </div>
        {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div className="pt-2">
        <button 
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : (
            <>
              <Send size={18} />
              <span>Complete Transfer</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TransferForm;
