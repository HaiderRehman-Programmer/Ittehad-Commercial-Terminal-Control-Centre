import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  iconColor = 'text-blue-500',
  iconBg = 'bg-blue-50',
  loading = false,
}) => {
  const isPositive = trend?.startsWith('+');
  const isNegative = trend?.startsWith('-');

  if (loading) {
    return (
      <div className="glass-surface relative p-6 h-[180px] overflow-hidden flex flex-col justify-between animate-entrant">
        <div className="absolute inset-0 bg-slate-900 -z-10" />
        <div className="shimmer-hc-layer opacity-40" />
        
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
            <div className="w-6 h-6 rounded-lg bg-slate-700 opacity-50" />
          </div>
          <div className="w-16 h-6 rounded-lg bg-slate-800 opacity-50" />
        </div>
        
        <div>
          <div className="w-24 h-2 bg-slate-800 rounded-full mb-4 opacity-40" />
          <div className="w-32 h-8 bg-slate-800 rounded-lg opacity-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-surface snappy-interaction relative p-6 transition-all duration-300 group hover:-translate-y-1 overflow-hidden z-10 animate-entrant">
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 rounded-2xl" />
      
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${iconColor} stroke-[2.5px]`} />
        </div>
        {trend && (
          <span className={`text-[12px] font-black px-2.5 py-1 rounded-lg ${isPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : isNegative ? 'text-rose-700 bg-rose-50 border border-rose-100' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.15em] mb-2 leading-none relative">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight drop-shadow-sm">
          {value}
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Verified Real-Time Metric
        </p>
      </div>
    </div>
  );
};
