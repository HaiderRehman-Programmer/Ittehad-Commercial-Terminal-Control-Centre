import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface ChartProps {
  title: string;
  data: any[];
  type?: 'line' | 'bar' | 'area';
  dataKeys: { key: string; color: string; name?: string }[];
  xAxisKey?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl border border-slate-100 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[11px] font-black tracking-[0.2em] uppercase text-indigo-500 mb-3 border-b border-slate-200/50 pb-2">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm shadow-sm" style={{ backgroundColor: p.color }} />
                <span className="text-[13px] font-bold text-slate-600">{p.name}</span>
              </div>
              <span className="font-black text-slate-900 text-[14px]">
                {/* Prefix with currency if value seems quite large, else just format */}
                {p.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardChart: React.FC<ChartProps> = ({
  title,
  data,
  type = 'line',
  dataKeys,
  xAxisKey = 'name',
  height = 300
}) => {
  const renderChartType = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {dataKeys.map((dk, i) => (
              <Bar key={i} dataKey={dk.key} name={dk.name || dk.key} fill={dk.color} radius={[4, 4, 0, 0]} barSize={type === 'bar' && dataKeys.length === 1 ? 40 : undefined} />
            ))}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {dataKeys.map((dk, i) => (
                <linearGradient key={i} id={`color${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dk.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={dk.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {dataKeys.map((dk, i) => (
              <Area key={i} type="monotone" dataKey={dk.key} name={dk.name || dk.key} stroke={dk.color} fillOpacity={1} fill={`url(#color${dk.key})`} strokeWidth={3} />
            ))}
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {dataKeys.map((dk, i) => (
              <Line key={i} type="monotone" dataKey={dk.key} name={dk.name || dk.key} stroke={dk.color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-slate-50/80 rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 z-10 overflow-hidden group">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-3xl -z-10 group-hover:bg-indigo-100/40 transition-colors duration-500" />
      
      <div className="flex items-center gap-3 mb-8">
         <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
         <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
      </div>
    <div className="relative z-10">
        {(!data || data.length === 0) ? (
          <div style={{ height: `${height}px` }} className="flex items-center justify-center">
            <p className="text-sm text-slate-300 font-bold uppercase tracking-widest">No data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {renderChartType()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
