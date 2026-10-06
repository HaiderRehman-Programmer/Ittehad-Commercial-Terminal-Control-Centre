import React, { useState } from 'react';
import api from '../../lib/api';
import { MapPin, Box, Layers, DollarSign, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const plotSchema = z.object({
  name: z.string().min(1, "Location Name is required"),
  marla: z.string().min(1, "Size is required"),
  dimensions: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  status: z.enum(["available", "token", "booked", "sold"])
});

const PlotForm = ({ onRefresh, onClose }) => {
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(plotSchema),
    defaultValues: { status: 'available' }
  });

  const onSubmit = async (data) => {
    setError('');
    try {
      await api.post('/map', data);
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create plot. Please try again.');
    }
  };

  return (
    <div className="p-1 px-5 pb-6 bg-white rounded-xl">
      <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <MapPin size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-blue-900 leading-tight">Create New Inventory</h3>
          <p className="text-[11px] text-blue-700 font-medium">Add a new plot or shop to the project map.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
          <X size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Location Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Box size={14} />
              </div>
              <input 
                {...register("name")}
                className={`w-full bg-slate-50 border py-2.5 pl-10 pr-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.name ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200'}`} 
                placeholder="e.g. Shop No 1" 
              />
            </div>
            {errors.name && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Size (Marla)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Layers size={14} />
              </div>
              <input 
                {...register("marla")}
                className={`w-full bg-slate-50 border py-2.5 pl-10 pr-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.marla ? 'border-red-400' : 'border-slate-200'}`}
                placeholder="e.g. 5.5 Marla" 
              />
            </div>
            {errors.marla && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.marla.message}</span>}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dimensions</label>
          <input 
            {...register("dimensions")}
            className="w-full bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
            placeholder="e.g. 40.00 x 31.60" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Price (PKR)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <DollarSign size={14} />
              </div>
              <input 
                type="number"
                {...register("price")}
                className={`w-full bg-slate-50 border py-2.5 pl-10 pr-4 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.price ? 'border-red-400' : 'border-slate-200'}`}
                placeholder="600000" 
              />
            </div>
            {errors.price && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.price.message}</span>}
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
            <select 
              {...register("status")}
              className="w-full bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl text-[13px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="available">Available</option>
              <option value="token">Token</option>
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={18} />
                <span>Onboard Inventory</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlotForm;
