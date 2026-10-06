import { useState } from 'react';
import api from '../../lib/api';
import { Tag, Hash, Save, X, Layers } from 'lucide-react';

const AccountForm = ({ type, editData = null, onRefresh, onClose = () => {} }) => {
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    code: editData?.code || '',
    type: editData?.type || type // asset, liability, equity, income, expense
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidCode, setIsValidCode] = useState(true);

  const validateCode = (code) => {
    // Expected pattern: XXX-000 (3 uppercase letters, dash, numbers)
    const pattern = /^[A-Z]{3}-\d+$/;
    return pattern.test(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!validateCode(formData.code)) {
        setError('Invalid Ledger Code format. Use XXX-000 (e.g., AST-101)');
        setLoading(false);
        return;
      }

      if (editData?.id) {
        await api.put(`/accounts/${editData.id}`, formData);
      } else {
        await api.post('/accounts', formData);
      }
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize account. Proceed with caution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 px-5 pb-6 bg-white rounded-xl">
      <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <Layers size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-blue-900 leading-tight uppercase tracking-tight">Chart of Accounts</h3>
          <p className="text-[11px] text-blue-700 font-medium">Define a new {type} ledger account for tracking.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
          <X size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Account Descriptor</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Tag size={14} />
            </div>
            <input 
              name="name" 
              required 
              className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
              placeholder="e.g. Office Equipment, Land" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ledger Code (Alpha-Numeric)</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Hash size={14} />
            </div>
            <input 
              name="code" 
              className={`w-full bg-slate-50 border py-2.5 pl-10 pr-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${!isValidCode ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200'}`} 
              placeholder="e.g. AST-101" 
              value={formData.code}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setFormData({...formData, code: val});
                setIsValidCode(validateCode(val) || val === '');
              }}
            />
          </div>
          {!isValidCode && (
            <p className="mt-1 text-[9px] font-black text-rose-500 uppercase tracking-tighter ml-1 animate-pulse">
               Format Violation: Use 3 Chars + Dash + Number
            </p>
          )}
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                <span>Initialize Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;
