import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, Clock, FileText,
  Wallet, UserCheck, Activity, Calendar, RotateCcw, Database, TrendingUp, MapPin
} from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { DashboardChart } from '../components/dashboard/DashboardChart';

import api from '../lib/api';

const DashboardSkeleton = () => (
  <div className="p-4 md:p-6 bg-slate-50/50 min-h-screen font-sans animate-entrant">
    <div className="mb-10 relative h-[380px] rounded-[32px] bg-slate-900 overflow-hidden border border-slate-800 shadow-2xl">
      <div className="shimmer-hc-layer opacity-20" />
      <div className="p-12 h-full flex flex-col justify-center gap-6 max-w-2xl relative z-10">
        <div className="w-48 h-10 bg-slate-800 rounded-2xl opacity-40 shadow-xl" />
        <div className="w-full h-16 bg-slate-800 rounded-2xl opacity-60 shadow-xl" />
        <div className="w-3/4 h-6 bg-slate-800 rounded-xl opacity-30 shadow-xl" />
        <div className="flex gap-4">
          <div className="w-32 h-10 bg-slate-800 rounded-full opacity-40" />
          <div className="w-32 h-10 bg-slate-800 rounded-full opacity-40" />
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center mb-10 gap-6 pb-6 border-b border-slate-100">
       <div className="w-64 h-8 bg-slate-200/50 rounded-xl animate-pulse" />
       <div className="w-48 h-10 bg-slate-200/50 rounded-2xl animate-pulse" />
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
       {Array(4).fill(0).map((_, i) => (
         <KPICard key={i} title="Loading..." value="---" icon={Activity} loading={true} />
       ))}
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
       {Array(4).fill(0).map((_, i) => (
         <KPICard key={i} title="Loading..." value="---" icon={Activity} loading={true} />
       ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
       <div className="h-80 bg-white border border-slate-100 rounded-[32px] shadow-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-slate-50/50" />
          <div className="absolute top-6 left-6 w-40 h-6 bg-slate-200 rounded-lg animate-pulse" />
          <div className="absolute inset-x-8 bottom-8 top-20 bg-slate-100 rounded-2xl animate-pulse" />
       </div>
       <div className="h-80 bg-white border border-slate-100 rounded-[32px] shadow-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-slate-50/50" />
          <div className="absolute top-6 left-6 w-40 h-6 bg-slate-200 rounded-lg animate-pulse" />
          <div className="absolute inset-x-8 bottom-8 top-20 bg-slate-100 rounded-2xl animate-pulse" />
       </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [revenueData, setRevenueData] = useState([]);
  const [salesMixData, setSalesMixData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [recoveryData, setRecoveryData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Performance Memoization for derived stats
  const isSyncing = useMemo(() => metrics && Object.keys(metrics).length > 0, [metrics]);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [
        metricsRes,
        revenueRes,
        salesMixRes,
        collectionRes,
        recoveryRes,
        bookingsRes,
        growthRes,
        notificationsRes
      ] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/dashboard/charts/revenue-trend'),
        api.get('/dashboard/charts/sales-mix'),
        api.get('/dashboard/charts/receivable-vs-collected'),
        api.get('/dashboard/charts/recovery-health'),
        api.get('/dashboard/charts/bookings'),
        api.get('/dashboard/charts/customer-growth'),
        api.get('/dashboard/notifications')
      ]);

      setMetrics(metricsRes.data);
      setRevenueData(revenueRes.data);
      setSalesMixData(salesMixRes.data);
      setCollectionData(collectionRes.data);
      setRecoveryData(recoveryRes.data);
      setBookingsData(bookingsRes.data);
      setGrowthData(growthRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // 60s "Pulse" Refresh
    const pulse = setInterval(fetchData, 60000);
    return () => clearInterval(pulse);
  }, [fetchData]);


  if (!metrics || Object.keys(metrics).length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50/50 min-h-screen font-sans">
      {/* High-Fidelity Branding Hero */}
      <div className="mb-10 relative h-[380px] rounded-[32px] overflow-hidden shadow-2xl border border-white/20 group">
         <img 
           src="/ittehad_commercial_hero_png_1775583487331.png" 
           alt="Ittehad Commercial Centre" 
           className="absolute inset-0 w-full h-full object-cover transition-transform duration-[30s] ease-linear group-hover:scale-110 will-change-transform"
           style={{ willChange: 'transform' }}
         />
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
         
         <div className="relative z-10 p-12 h-full flex flex-col justify-between max-w-2xl">
            <div className="flex items-center gap-3 animate-fade-in-up">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                  <Activity size={20} className="stroke-[3]" />
               </div>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] drop-shadow-md">Operational Excellence</span>
            </div>
            
            <div>
               <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight mb-4 drop-shadow-2xl">
                  Ittehad Commercial <br />
                  <span className="text-indigo-400">Command Centre</span>
               </h1>
               <p className="text-slate-300 text-sm font-bold uppercase tracking-widest leading-loose mb-8 opacity-80 max-w-lg drop-shadow-lg">
                  Strategic portfolio management and real-time administrative orchestration.
               </p>
               
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                     Secure Access
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest shadow-xl">
                     <Database size={12} />
                     Real-time Ledger
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Strategic Operational Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 pb-6 border-b border-slate-100">
        <div>
           <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Strategic Overview</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              Regional Performance & Operational Benchmarks
           </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm flex-1 lg:flex-none">
            <Calendar className="text-slate-400" size={18} />
            <span className="text-[12px] font-black text-slate-700 uppercase tracking-widest leading-none">
               {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <button 
            onClick={fetchData} 
            className="bg-slate-900 hover:bg-black text-white p-3 rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-95"
            title="Refresh Dashboard"
          >
             <RotateCcw size={18} className="stroke-[3]" />
          </button>
        </div>
      </div>

      {/* KPI Grid - High Density */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KPICard title="Portfolio Balance" value={metrics.availableBalance} trend="+2.4%" icon={Wallet} iconColor="text-blue-500" iconBg="bg-white" />
        <KPICard title="Total Visitors" value={metrics.totalVisitors} trend="+12%" icon={Users} iconColor="text-rose-400" iconBg="bg-white" />
        <KPICard title="Active Customers" value={metrics.customers} trend="+5%" icon={Users} iconColor="text-amber-500" iconBg="bg-white" />
        <KPICard title="System Access" value={metrics.systemUsers} trend="Active" icon={UserCheck} iconColor="text-emerald-500" iconBg="bg-white" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KPICard title="Property Units" value={metrics.totalShops} trend="0" icon={MapPin} iconColor="text-amber-500" iconBg="bg-white" />
        <KPICard title="Inventory Sold" value={metrics.soldShop} trend="+3%" icon={CheckCircle} iconColor="text-blue-500" iconBg="bg-white" />
        <KPICard title="Market Demand" value={metrics.unsoldShops} trend="-2" icon={Clock} iconColor="text-emerald-500" iconBg="bg-white" />
        <KPICard title="Sales Volume" value={metrics.totalTownSales} trend="+15%" icon={TrendingUp} iconColor="text-rose-400" iconBg="bg-white" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardChart 
          title="Revenue Trend" 
          type="area" 
          data={revenueData} 
          dataKeys={[
            { key: 'april', color: '#3b82f6', name: 'Real Revenue' }
          ]} 
        />
        <DashboardChart 
          title="Sales Mix" 
          type="bar" 
          data={salesMixData} 
          dataKeys={[
            { key: 'value', color: '#10b981', name: 'Units Sold' }
          ]} 
        />
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm mb-12">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                 <Activity size={16} strokeWidth={3} />
              </div>
              Live Forensic Stream
           </h3>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Syncing...</span>
           </div>
        </div>
        <div className="divide-y divide-slate-50">
           {notifications.map((n: any, i) => (
             <div key={i} className="p-5 hover:bg-slate-50/80 transition-colors flex items-center gap-5 group">
                <div className="relative shrink-0">
                   <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-xl transition-transform group-hover:scale-110 duration-300">
                      <img 
                        src={`https://i.pravatar.cc/150?u=ittehad_acc_${n.type}_${i}`} 
                        alt="Operator" 
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center shadow-lg border-2 border-white ${n.type === 'booking' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                      {n.type === 'booking' ? <CheckCircle size={10} strokeWidth={3} /> : <FileText size={10} strokeWidth={3} />}
                   </div>
                </div>
                <div className="flex-1">
                   <p className="text-[14px] font-black text-slate-800 leading-snug tracking-tight">{n.message}</p>
                   <div className="flex items-center gap-4 mt-2 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <span className="flex items-center gap-1.5 opacity-60"><Clock size={12} strokeWidth={3} /> {n.date}</span>
                      <span className={`px-2.5 py-1 rounded-md text-[9px] ${n.type === 'booking' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{n.type} Management</span>
                   </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                   <button 
                     onClick={() => navigate(n.type === 'booking' ? '/sale/bookings' : '/reports/trial')}
                     className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                   >
                     Audit
                   </button>
                </div>
             </div>
           ))}
           {notifications.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center opacity-30 gap-3">
                 <Activity size={48} className="text-slate-400" />
                 <p className="text-xs font-black uppercase tracking-[0.3em]">{isSyncing ? 'Establishing Connection...' : 'Operational void detected.'}</p>
              </div>
           )}
        </div>
      </div>

      {/* Secondary Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardChart 
          title="Goal Alignment" 
          type="area" 
          data={collectionData} 
          dataKeys={[
            { key: 'receivable', color: '#cbd5e1', name: 'Strategic Goal' },
            { key: 'collected', color: '#6366f1', name: 'Actual Yield' }
          ]} 
        />
        <DashboardChart 
          title="Recovery Velocity" 
          type="bar" 
          data={recoveryData} 
          dataKeys={[
            { key: 'overdue', color: '#f43f5e', name: 'Arrears' }
          ]} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <DashboardChart 
          title="Contract Acquisition" 
          type="line" 
          data={bookingsData} 
          dataKeys={[
            { key: 'bookings', color: '#f59e0b', name: 'New Contracts' }
          ]} 
        />
        <DashboardChart 
          title="Regional Expansion" 
          type="area" 
          data={growthData} 
          dataKeys={[
            { key: 'customers', color: '#6366f1', name: 'Total Accounts' }
          ]} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
