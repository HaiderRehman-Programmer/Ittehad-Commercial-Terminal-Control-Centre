import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { 
  FileText, 
  Search, 
  Filter, 
  RotateCcw,
  CreditCard,
  Send,
  User,
  HandCoins,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useModal } from '../components/Modal';
import InstallmentPaymentForm from '../components/forms/InstallmentPaymentForm';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import SkeletonTable from '../components/SkeletonTable';
import { generateStrategicPDF } from '../utils/reportUtils';
import { formatPKR } from '../utils/financeUtils';
import toast from 'react-hot-toast';

const CustomerRecoverySheet = () => {
  const [recoveries, setRecoveries] = useState([]);
  const [riskReport, setRiskReport] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dateFilters, setDateFilters] = useState({ from: '', to: '' });
  const [filter, setFilter] = useState('all');
  const { openModal } = useModal();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recoveryRes, riskRes] = await Promise.all([
        api.get('/report/customer-recovery', { params: dateFilters }),
        api.get('/reports/recovery-risk')
      ]);
      setRecoveries(Array.isArray(recoveryRes.data) ? recoveryRes.data : (recoveryRes.data?.data || []));
      setRiskReport(Array.isArray(riskRes.data) ? riskRes.data : (riskRes.data?.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateFilters]);

  useEffect(() => {
    document.title = "Recovery Intelligence Hub | ITTEHAD Commercial";
    fetchData();
  }, [fetchData]);

  const fetchRecoveries = () => fetchData();

  const handleFilter = (e) => {
    e.preventDefault();
    if (!dateFilters.from && !dateFilters.to) {
        toast.error('Please select a date range first');
        return;
    }
    fetchRecoveries();
  };

  const handleReset = () => {
    setDateFilters({ from: '', to: '' });
    setSearchTerm('');
    setTimeout(fetchRecoveries, 0);
  };

  const filteredRecoveries = recoveries.filter(r => {
    const matchesSearch = r.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const amount = r.short_amount || 0;
    if (filter === 'high') return matchesSearch && amount >= 500000;
    if (filter === 'critical') return matchesSearch && amount >= 1000000;
    return matchesSearch;
  });

  const totalArrears = recoveries.reduce((sum, r) => sum + (r.short_amount || 0), 0);
  const atRiskValue = riskReport.reduce((sum, r) => sum + (r.overdueAmount || 0), 0);
  const criticalCount = riskReport.filter(r => r.riskLevel === 'Critical').length;

  const mergedRecoveries = filteredRecoveries.map(rec => {
    const risk = riskReport.find(r => r.id === rec.id);
    return { ...rec, risk };
  });

  const handleExportPDF = () => {
    if (mergedRecoveries.length === 0) return;
    
    const headers = ['Identity', 'Arrears (PKR)', 'Risk Portfolio', 'Forensic Status'];
    const body = mergedRecoveries.map(r => [
      r.customer_name.toUpperCase(),
      formatPKR(r.short_amount),
      r.risk ? `${r.risk.riskLevel} (${r.risk.maxDelayDays} Days)` : 'Clear',
      r.risk?.riskLevel === 'Critical' ? 'LEGAL ACTION REQ' : 'COLLECTION'
    ]);

    generateStrategicPDF({
      title: 'Forensic Recovery & Risk Intelligence Audit',
      subtitle: `Aggregate arrears: ${formatPKR(totalArrears)} | At-Risk Portfolio: ${formatPKR(atRiskValue)} | Period: ${dateFilters.from || 'All'} to ${dateFilters.to || 'Present'}`,
      headers,
      body,
      filename: `recovery_risk_audit_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb ... */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-indigo-600 transition-colors tracking-widest">Financial Intelligence</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Risk Maturity</small>
      </nav>

      {/* Header Section ... */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Recovery Intelligence Matrix
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
               <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Risk Stream Active</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Dossier-Level Liquidation Analysis</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:rotate-180 duration-500"
            title="Update Data Matrix"
          >
            <RotateCcw size={18} strokeWidth={3} />
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-slate-700"
          >
            <FileText size={16} strokeWidth={3} /> 
            <span>Forensic Export</span>
          </button>
        </div>
      </div>

      {/* Recovery Summary Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group border-b-4 border-indigo-600">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100 transition-all duration-700" />
           <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                 <TrendingUp size={28} strokeWidth={2.5} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Aggregate Portfolio Balance</div>
                 <div className="text-2xl font-black text-slate-900 leading-none">{formatPKR(totalArrears)}</div>
              </div>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group border-b-4 border-rose-600">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-100 transition-all duration-700" />
           <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
                 <AlertCircle size={28} strokeWidth={2.5} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">At-Risk Portfolio Value</div>
                 <div className="text-2xl font-black text-rose-600 leading-none">{formatPKR(atRiskValue)}</div>
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group border-b-4 border-emerald-600">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-100 transition-all duration-700" />
           <div className="relative z-10 flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                 <Clock size={28} strokeWidth={2.5} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">Critical Overdue Dossiers</div>
                 <div className="text-2xl font-black text-slate-900 leading-none">{criticalCount} <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Risk Flagged</span></div>
              </div>
           </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 border-l-4 border-l-indigo-600">
        <form onSubmit={handleFilter} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full relative">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">From Date</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-700"
              value={dateFilters.from}
              onChange={(e) => setDateFilters({...dateFilters, from: e.target.value})}
            />
          </div>
          <div className="hidden md:flex items-center pb-3 opacity-20 text-indigo-500">
             <ArrowRight size={20} strokeWidth={3} />
          </div>
          <div className="flex-1 w-full relative">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">To Date</label>
            <input 
              type="date" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-slate-700"
              value={dateFilters.to}
              onChange={(e) => setDateFilters({...dateFilters, to: e.target.value})}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              type="submit"
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              <Filter size={14} strokeWidth={3} /> Filter
            </button>
            <button 
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all"
            >
              <RotateCcw size={14} strokeWidth={3} /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          {[
            { id: 'all', label: 'All Portfolios' },
            { id: 'high', label: 'High Priority (5Lac+)' },
            { id: 'critical', label: 'Critical (10Lac+)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === tab.id 
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
              placeholder="Search Client Portfolio..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm font-bold text-slate-700 transition-all group-hover:border-indigo-300 border-l-4 border-l-indigo-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={16} strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
        {loading ? (
          <SkeletonTable rows={10} columns={3} />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Identity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[280px]">Amortized Arrears</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-[160px]">Liquidation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mergedRecoveries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-30 gap-3">
                       <Clock size={48} className="text-slate-400" />
                       <p className="text-sm font-black uppercase tracking-widest text-slate-500">No recovery operations pending in system registry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                mergedRecoveries.map((rec, idx) => {
                  const riskLevel = rec.risk?.riskLevel || 'Standard';
                  const riskColor = 
                    riskLevel === 'Critical' ? 'bg-rose-600' :
                    riskLevel === 'High' ? 'bg-amber-500' :
                    riskLevel === 'Medium' ? 'bg-indigo-500' : 'bg-slate-400';

                  return (
                    <tr key={idx} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${
                            riskLevel === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm' : 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm'
                          }`}>
                            <User size={20} strokeWidth={3} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-2">{rec.customer_name}</span>
                             <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${riskColor} animate-pulse`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${
                                  riskLevel === 'Critical' ? 'text-rose-600' : 'text-slate-400'
                                }`}>
                                   {riskLevel}: {rec.risk?.maxDelayDays || 0} Days Past Due
                                </span>
                             </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className={`text-[17px] font-black font-mono tracking-tight ${riskLevel === 'Critical' ? 'text-rose-600' : 'text-slate-900'}`}>
                              {formatPKR(rec.short_amount)}
                            </span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5 italic">Amortized Arrearage</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                             onClick={() => openModal(`Collect Installment: ${rec.customer_name}`, <InstallmentPaymentForm customerId={rec.id} onRefresh={fetchData} />)}
                             className="bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-emerald-100 shadow-sm active:scale-90"
                           >
                             <HandCoins size={14} strokeWidth={3} /> 
                             <span>Collect</span>
                           </button>
                           {rec.risk && (
                             <button 
                               onClick={() => generateStrategicPDF({
                                 title: 'OFFICIAL PAYMENT NOTICE',
                                 subtitle: `Urgent Recovery Directive for ${rec.customer_name}`,
                                 headers: ['NOTICE ITEM', 'VALUE'],
                                 body: [
                                   ['CUSTOMER NAME', rec.customer_name.toUpperCase()],
                                   ['OUTSTANDING BALANCE', formatPKR(rec.short_amount)],
                                   ['RISK CLASSIFICATION', rec.risk.riskLevel],
                                   ['DAYS OVERDUE', `${rec.risk.maxDelayDays} DAYS`],
                                   ['NOTICE DATE', new Date().toLocaleDateString()]
                                 ],
                                 filename: `notice_${rec.customer_name}.pdf`
                               })}
                               className="bg-slate-900 hover:bg-black text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-90"
                               title="Generate Strategic Notice"
                             >
                               <FileText size={14} strokeWidth={3} />
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-[9999]">
        <button 
          onClick={() => openModal('Record Recovery', <PaymentForm onRefresh={fetchRecoveries} />)}
          className="w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/30 transition-all hover:scale-110 active:scale-95 group relative border-b-4 border-rose-800"
        >
          <CreditCard size={24} strokeWidth={3} />
        </button>
        <button 
          onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchRecoveries} />)}
          className="w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all hover:scale-110 active:scale-95 group relative border-b-4 border-amber-700"
        >
          <Send size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Footer Branding Footer */}
      <footer className="mt-12 py-12 text-center border-t border-slate-200">
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">
            ITTEHAD COMMERCIAL CENTRE | CLIENT AUDIT TERMINAL
         </div>
         <p className="text-[10px] font-bold text-slate-400 tracking-widest max-w-lg mx-auto leading-relaxed border border-slate-100 p-4 rounded-2xl bg-white/50 shadow-sm opacity-80 uppercase italic">
            Customer recovery dossiers are synchronized with the central financial matrix. Any deviation triggers a forensic asset review.
         </p>
      </footer>
    </div>
  );
};

export default CustomerRecoverySheet;
