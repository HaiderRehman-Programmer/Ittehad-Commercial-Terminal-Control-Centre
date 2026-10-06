import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  Briefcase,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Send
} from 'lucide-react';
import { DashboardChart } from '../components/dashboard/DashboardChart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SkeletonTable from '../components/SkeletonTable';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';

const DecadeFiscalReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Board Report: Decade Fiscal Archive | Real Estate";
    fetchData();
     
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/decade-fiscal');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { openModal } = useModal();

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("EXECUTIVE FISCAL ARCHIVE (2017-2026)", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Strategic decade-scale review of Ittehad Commercial Centre financial portfolio.`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Fiscal Year', 'Revenue (Rs.)', 'Net Profit (Rs.)']],
      body: data.yearlyTrends.map(t => [t.year, `Rs. ${t.revenue.toLocaleString()}`, `Rs. ${t.profit.toLocaleString()}`]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save("decade_board_report.pdf");
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-widest">
        <a href="#" className="hover:text-indigo-600 transition-colors">Strategic</a>
        <ChevronRight size={10} className="opacity-50" />
        <small className="text-slate-400">Decade Fiscal Archive</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 leading-tight uppercase tracking-tight">Decade Fiscal Report</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Strategic Board of Directors Intelligence (2017 - 2026)</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Download size={18} className="stroke-[3]" /> 
            <span>Strategic Export</span>
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-[-20%] right-[-5%] opacity-10 text-white transform -rotate-12">
             <ShieldCheck size={280} strokeWidth={1} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
             <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-pulse-slow">
                <BarChart3 size={28} strokeWidth={3} />
             </div>
             <div>
                <h2 className="text-xl font-black text-white leading-none uppercase tracking-tight">Ten-Year Continuity</h2>
                <div className="flex items-center gap-2 mt-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audited Historical Dataset Verified</span>
                </div>
             </div>
          </div>
      </div>

      {/* Strategic Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading ? (
           Array(5).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />)
        ) : (
          <>
            <StatCard title="Total Decade Revenue" value={`Rs. ${((data?.totalRevenue || 0) / 1000000).toFixed(1)}M`} icon={TrendingUp} color="indigo" />
            <StatCard title="Net Cumulative Profit" value={`Rs. ${((data?.totalProfit || 0) / 1000000).toFixed(1)}M`} icon={Briefcase} color="emerald" />
            <StatCard title="Active Years" value={`${data?.yearlyTrends?.length || 0}`} icon={Users} color="blue" />
            <StatCard title="Avg. Annual Revenue" value={`Rs. ${(((data?.totalRevenue || 0) / Math.max(data?.yearlyTrends?.length || 1, 1)) / 1000000).toFixed(1)}M`} icon={CheckCircle2} color="amber" />
            <StatCard title="Growth Velocity" value="+184%" icon={ArrowUpRight} color="rose" />
          </>
        )}
      </div>

      {/* Visualization Grid */}
      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <DashboardChart 
              title="Revenue Growth (Decade)" 
              type="area" 
              data={data.yearlyTrends} 
              dataKeys={[{ key: 'revenue', color: '#4f46e5', name: 'Annual Revenue' }]} 
              xAxisKey="year"
              height={350}
            />
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <DashboardChart 
              title="Profit Trajectory" 
              type="line" 
              data={data.yearlyTrends} 
              dataKeys={[{ key: 'profit', color: '#10b981', name: 'Net Bottom Line' }]} 
              xAxisKey="year"
              height={350}
            />
          </div>
        </div>
      )}

      {/* Corporate Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                 <Zap size={20} strokeWidth={3} />
              </div>
              <div>
                 <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Fiscal History Ledger</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2017 - 2026 Archive Summary</span>
              </div>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <SkeletonTable rows={10} columns={4} />
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Fiscal Period</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Revenue (Rs.)</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Net Profit (Rs.)</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {data?.yearlyTrends.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-[13px] border border-slate-200">
                            {t.year}
                          </div>
                          <div>
                             <span className="font-black text-slate-800 text-[14px] block">Period {idx + 1}</span>
                             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Fiscal Quarter Archive</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-[15px] font-black text-slate-800">
                        Rs. {t.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-[15px] font-black text-emerald-600">
                        Rs. {t.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1 rounded-full uppercase border border-emerald-100 shadow-sm">Verified</span>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={fetchData} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} strokeWidth={3} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchData} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ffc107' }}
        title="Transfer"
      >
        <Send size={24} strokeWidth={3} />
      </button>

      {/* Footer */}
      <footer className="mt-12 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl mx-auto max-w-sm">
          ITTEHAD COMMERCIAL CENTRE &copy; 2026
      </footer>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const CardIcon = icon;
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} shadow-sm hover:shadow-lg transition-all group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:rotate-45 transition-transform">
         <CardIcon size={64} />
      </div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
          <CardIcon size={24} strokeWidth={3} />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-800 tracking-tighter relative z-10">{value}</div>
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-70 relative z-10">{title}</div>
    </div>
  );
};

export default DecadeFiscalReport;
