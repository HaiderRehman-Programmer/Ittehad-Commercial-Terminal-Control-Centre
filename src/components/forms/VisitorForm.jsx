import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const VisitorForm = ({ onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    cnic: '',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/visitors', formData);
      onRefresh();
      // Dispatch event to close modal (or handled by parent)
      window.dispatchEvent(new CustomEvent('closeModal'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to save visitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Visitor Name <span className="text-red-500">*</span></label>
        <input 
          type="text" 
          required 
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Contact No <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            required 
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">CNIC (Optional)</label>
          <input 
            type="text" 
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.cnic}
            onChange={(e) => setFormData({...formData, cnic: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Address</label>
        <input 
          type="text" 
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Description / Note</label>
        <textarea 
          rows={3}
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        ></textarea>
      </div>
      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-[13px] font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Visitor'}
        </button>
      </div>
    </form>
  );
};

export default VisitorForm;
