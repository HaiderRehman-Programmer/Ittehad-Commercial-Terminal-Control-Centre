import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Search, 
  Filter, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { generateStrategicPDF } from '../utils/reportUtils';
import { formatPKR } from '../utils/financeUtils';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';

const RecoverySheet = () => {
  const [recoveries, setRecoveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    document.title = "Recovery Intelligence | Real Estate";
    fetchRecoveries();
  }, []);

  const fetchRecoveries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tokens');
      const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRecoveries(arr);
    } catch (err) {
      console.error(err);
      setRecoveries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecoveries = recoveries.filter(r => {
    const matchesSearch = 
      r.token_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.plot_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isDelinquent = (r.received_amount || 0) < (r.per_month_installment || 0);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && isDelinquent) ||
      (statusFilter === 'recovered' && !isDelinquent);
      
    return matchesSearch && matchesStatus;
  });

  const totalExpected = recoveries.reduce((sum, r) => sum + (r.per_month_installment || 0), 0);
  const totalReceived = recoveries.reduce((sum, r) => sum + (r.received_amount || 0), 0);
  const totalOutstanding = totalExpected - totalReceived;
  const recoveryVelocity = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0;

  const handleExportPDF = () => {
    const headers = ['Identity/Unit', 'Liability (PKR)', 'Liquidated (PKR)', 'Arrears (PKR)', 'Aging Status'];
    const body = filteredRecoveries.map(r => [
      `${r.customer_name?.toUpperCase()}\n${r.plot_name || 'N/A'}`,
      formatPKR(r.per_month_installment || 0),
      formatPKR(r.received_amount || 0),
      formatPKR((r.per_month_installment || 0) - (r.received_amount || 0)),
      (r.received_amount || 0) >= (r.per_month_installment || 0) ? 'CLEAR' : 'DELINQUENT'
    ]);

    generateStrategicPDF({
      title: 'Forensic Recovery Intelligence Audit',
      subtitle: `Recovery Velocity: ${recoveryVelocity.toFixed(1)}% | Aggregate Arrears: ${formatPKR(totalExpected - totalReceived)}`,
      headers,
      body,
      filename: `recovery_audit_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20 entrant-snappy">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-indigo-600 transition-colors tracking-widest">Financial Intelligence</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Recovery Matrix</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Recovery Intelligence Hub
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
               <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Live Delinquency Tracking</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Forensic Liquidity & Collection Terminal</p>
        </div>
        
        <div className="flex gap-3">
          <button 
             onClick={fetchRecoveries}
             className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:rotate-180 duration-500"
             title="Sync Ledger"
          >
             <RotateCcw size={18} strokeWidth={3} />
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-slate-700"
          >
            <FileText size={16} strokeWidth={3} /> 
            <span>Strategic Audit</span>
          </button>
        </div>
      </div>

      {/* Forensic Recovery Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Demand Aggregate', value: formatPKR(totalExpected), icon: TrendingUp, color: 'indigo' },
          { label: 'Collection Liquidated', value: formatPKR(totalReceived), icon: CheckCircle2, color: 'emerald' },
          { label: 'Aggregate Arrears', value: formatPKR(totalExpected - totalReceived), icon: AlertCircle, color: 'rose' },
          { label: 'Recovery Velocity', value: `${recoveryVelocity.toFixed(1)}%`, icon: Clock, color: 'amber' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${kpi.color}-50/30 rounded-full blur-2xl -mr-6 -mt-6`} />
            <div className={`w-9 h-9 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center mb-3 border border-${kpi.color}-100 shadow-inner shrink-0`}>
              <kpi.icon size={18} strokeWidth={3} />
            </div>
            <div className="text-[17px] font-black text-slate-900 tracking-tight leading-none mb-1">{kpi.value}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
            {i === 3 && (
               <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(recoveryVelocity, 100)}%` }} />
               </div>
            )}
          </div>
        ))}
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Global Registry' },
            { id: 'pending', label: 'Delinquent' },
            { id: 'recovered', label: 'Liquidated' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
           <input 
              type="text"
              placeholder="Search Identity or Plot ID..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-bold text-slate-700 transition-all group-hover:border-indigo-300 border-l-4 border-l-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={16} strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Collection Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
        {loading ? (
          <SkeletonTable rows={10} columns={5} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer & Unit</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Liability Demand</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Liquidated Funds</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Forensic Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acquisition Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecoveries.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-12">
                      <EmptyState 
                        title="No Delinquency Signatures" 
                        description="The system has zeroed out all arrears matching your active filter profile."
                        icon={CheckCircle2}
                        action={{
                          label: "Refresh Intelligence",
                          onClick: fetchRecoveries
                        }}
                      />
                   </td>
                </tr>
              ) : (
                filteredRecoveries.map((r, idx) => (
                   <tr key={idx} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight">{r.customer_name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{r.plot_name || 'Plot Registry Hub'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="text-[14px] font-black text-slate-900 font-mono italic">{formatPKR(r.per_month_installment || 0)}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className={`text-[14px] font-black font-mono italic ${r.received_amount >= r.per_month_installment ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {formatPKR(r.received_amount || 0)}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${r.received_amount >= r.per_month_installment ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {r.received_amount >= r.per_month_installment ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {r.received_amount >= r.per_month_installment ? 'Recovered' : 'Delinquent'}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right text-[11px] font-bold text-slate-400 font-mono">
                         {r.created_at ? new Date(r.created_at).toLocaleDateString() : '---'}
                      </td>
                   </tr>
                ))
              )}
            </tbody>
            {/* Totals Footer */}
            {filteredRecoveries.length > 0 && (
                <tfoot className="bg-slate-900 text-white shadow-2xl relative z-10">
                  <tr className="divide-x divide-slate-800">
                    <td colSpan={3} className="px-6 py-6 text-[12px] font-black text-right uppercase tracking-[0.2em] text-slate-500">
                        Total System Liquidity Gap
                    </td>
                    <td colSpan={2} className="px-6 py-6 text-[20px] font-black text-right text-rose-500 font-mono pr-10">
                        {formatPKR(totalOutstanding)}
                    </td>
                  </tr>
                </tfoot>
            )}
          </table>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 py-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-t border-slate-200 bg-white/50 rounded-xl mx-auto max-w-sm">
          ITTEHAD COMMERCIAL CENTRE &copy; 2026
      </footer>
    </div>
  );
};

export default RecoverySheet;
