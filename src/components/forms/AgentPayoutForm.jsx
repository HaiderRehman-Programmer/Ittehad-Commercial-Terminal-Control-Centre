import React, { useState } from 'react';
import { 
  DollarSign, 
  Save, 
  X, 
  Wallet, 
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatPKR } from '../../utils/financeUtils';
import { generatePayoutVoucher } from '../../utils/reportUtils';

const AgentPayoutForm = ({ agent, onRefresh, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error('Invalid Payout Amount');
    if (amount > agent.total_commission) return toast.error('Insufficient Commission Balance');

    setLoading(true);
    try {
      await api.post(`/agents/${agent.id}/payout`, {
        amount: parseFloat(amount),
        description,
        date
      });
      
      setGenerating(true);
      toast.success('Commission Liquidated Successfully');
      
      // Trigger Strategic Voucher Generation
      generatePayoutVoucher({
        agentName: agent.name,
        amount: parseFloat(amount),
        date: date,
        description: description,
        balanceAfter: agent.total_commission - parseFloat(amount)
      });

      if (onRefresh) onRefresh();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payout Process Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 bg-rose-600 text-white flex justify-between items-start">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Wallet className="text-rose-200" size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-100">Commission Liquidation</span>
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight leading-none">{agent.name}</h2>
           <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest mt-2 flex items-center gap-2 italic">
             Available: {formatPKR(agent.total_commission)}
           </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-4">
           <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} strokeWidth={3} />
           <p className="text-[11px] text-amber-800 font-bold leading-relaxed uppercase">
             Processing a payout will deduct the amount from the agent's total commission and record a double-entry expense in the treasury.
           </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">Liquidation Date</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={3} />
              <input 
                type="date"
                required
                className="w-full bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl text-[13px] font-black focus:ring-4 focus:ring-rose-500/5 transition-all text-slate-800"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">Payout Amount (Rs.)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={16} strokeWidth={3} />
              <input 
                type="number"
                required
                max={agent.total_commission}
                className="w-full bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl text-[15px] font-black focus:ring-4 focus:ring-rose-500/5 transition-all text-slate-900"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
           <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">Forensic Description</label>
           <textarea 
             className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[13px] font-bold focus:ring-4 focus:ring-rose-500/5 transition-all text-slate-800"
             rows={3}
             placeholder="e.g. Monthly Commission Payout for March 2026..."
             value={description}
             onChange={(e) => setDescription(e.target.value)}
           />
        </div>

        <div className="pt-4">
           <button 
             type="submit"
             disabled={loading || generating}
             className="w-full flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 border-b-4 border-rose-800"
           >
             {loading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
             ) : generating ? (
               <>
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 <span>Building Voucher...</span>
               </>
             ) : (
               <>
                 <CheckCircle2 size={20} strokeWidth={3} />
                 <span>Authorize Payout</span>
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
};

export default AgentPayoutForm;
