import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ title, description, icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border-2 border-dashed border-slate-100 animate-entrant">
      <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-indigo-400 mb-6 shadow-2xl relative overflow-hidden group">
        <div className="shimmer-hc-layer opacity-20" />
        <Icon size={40} strokeWidth={1.5} className="relative z-10 transition-transform group-hover:scale-110 duration-300" />
      </div>
      
      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{title}</h3>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center max-w-xs leading-relaxed mb-8">
        {description}
      </p>

      {action && (
        <button 
          onClick={action.onClick}
          className="snappy-interaction group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
            <Plus size={16} strokeWidth={3} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{action.label}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;

