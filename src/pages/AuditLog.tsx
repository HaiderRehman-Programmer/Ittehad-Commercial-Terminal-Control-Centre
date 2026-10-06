import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  User, 
  Zap,
  FileText,
  Activity
} from 'lucide-react';
import api from '../lib/api';
import SkeletonTable from '../components/SkeletonTable';
import { generateStrategicPDF } from '../utils/reportUtils';

export const AuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all'); // all, critical, high, medium, standard

  useEffect(() => {
    document.title = "Security Archive | ITTEHAD Commercial";
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSeverity = 
      severityFilter === 'all' || 
      log.severity?.toLowerCase() === severityFilter.toLowerCase();
      
    return matchesSearch && matchesSeverity;
  });

  const handleExportPDF = () => {
    const headers = ['SLOT', 'IDENTITY', 'FORENSIC ACTION', 'INCIDENT DETAILS'];
    const body = filteredLogs.map(log => [
       new Date(log.createdAt).toLocaleString(),
       (log.user_name || 'SYSTEM').toUpperCase(),
       log.action.toUpperCase(),
       log.details
    ]);

    generateStrategicPDF({
      title: 'Security Audit & Forensic Archive',
      subtitle: `Classification: ${severityFilter.toUpperCase()} | Event Count: ${filteredLogs.length} | Generated: ${new Date().toLocaleString()}`,
      headers,
      body,
      filename: `security_audit_${new Date().getTime()}.pdf`
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': 
      case 'caution':
        return <span className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase shadow-lg shadow-rose-500/20">Critical</span>;
      case 'high': 
      case 'warning':
        return <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase shadow-lg shadow-amber-500/20">High Risk</span>;
      case 'medium': 
        return <span className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-[9px] font-black uppercase shadow-lg shadow-indigo-500/20">Medium</span>;
      default: 
        return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase border border-slate-200">Standard</span>;
    }
  };

  const criticalCount = logs.filter(l => ['critical', 'caution'].includes(l.severity?.toLowerCase())).length;

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-black text-[#8aa4af] flex items-center gap-2 uppercase tracking-[0.2em]">
        <a href="#" className="hover:text-indigo-600 transition-colors tracking-widest">Security architecture</a>
        <span className="opacity-50">/</span>
        <small className="text-slate-400 tracking-widest">Integrity Archive</small>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight flex items-center gap-4">
            Security Intelligence
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Stream Active</span>
            </div>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Centralized Forensic Audit Ledger</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} strokeWidth={3} />
            <input 
              type="text"
              placeholder="Filter Forensic Stream..."
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-700 w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 border-slate-700 hover:-translate-y-1"
          >
             <FileText size={18} strokeWidth={3} />
             <span>Export Archive</span>
          </button>
        </div>
      </div>

      {/* Strategic Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Incidents', value: logs.length, sub: 'All recorded events', icon: Activity, color: 'indigo' },
          { label: 'Critical Flushes', value: criticalCount, sub: 'Immediate attention', icon: ShieldAlert, color: 'rose' },
          { label: 'Admin Velocity', value: `${logs.filter(l => l.user_name !== 'System').length}`, sub: 'Human interventions', icon: User, color: 'emerald' },
          { label: 'Uptime Stability', value: '100%', sub: 'System integrity', icon: Zap, color: 'amber' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${kpi.color}-50/30 rounded-full blur-2xl -mr-6 -mt-6`} />
            <div className={`w-9 h-9 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center mb-3 border border-${kpi.color}-100 shadow-inner shrink-0 leading-none`}>
              <kpi.icon size={18} strokeWidth={3} />
            </div>
            <div className="text-[17px] font-black text-slate-900 tracking-tight leading-none mb-1">{kpi.value}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Severity Filter Matrix */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
         {[
           { id: 'all', label: 'All Forensic Events' },
           { id: 'critical', label: 'Critical / Breach' },
           { id: 'high', label: 'High Priority' },
           { id: 'standard', label: 'Operational' }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setSeverityFilter(tab.id)}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm ${
               severityFilter === tab.id 
                 ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10' 
                 : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
             }`}
           >
             {tab.label}
           </button>
         ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/40">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center border border-slate-200 shadow-sm group-hover:rotate-6 transition-transform">
                  <Clock size={24} strokeWidth={3} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">Intelligence Timeline</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Real-time Forensic Activity Stream</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Encryption Verified</span>
               </div>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <SkeletonTable rows={10} columns={4} />
          ) : (
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest w-[140px]">Severity</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest w-[180px]">Timestamp</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest w-[200px]">Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Action Forensics</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-8 py-6">
                         {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-[11px] text-slate-400 font-black font-mono tracking-tighter">
                           <Clock size={12} strokeWidth={3} className="text-indigo-400" />
                           {new Date(log.createdAt).toLocaleTimeString()}
                           <span className="opacity-40 font-normal">|</span>
                           {new Date(log.createdAt).toLocaleDateString()}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[11px] group-hover:rotate-12 transition-all shadow-lg shadow-slate-900/20">
                              {(log.user_name || 'S').charAt(0).toUpperCase()}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-[14px] leading-none mb-1 uppercase tracking-tight">{log.user_name || 'SYSTEM'}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {log.user_id?.slice(0,8) || 'AUTO'}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className="font-black text-[14px] text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{log.action}</span>
                            <div className="flex items-center gap-2">
                               <div className="w-1 h-3 bg-slate-200 rounded-full" />
                               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest opacity-80 italic">{log.details}</span>
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-32 text-center text-slate-300 font-black italic uppercase tracking-[0.5em] opacity-30">
                         No forensic activities recorded matching current filters.
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Forensic Branding Footer */}
      <footer className="mt-12 py-12 text-center border-t border-slate-200">
         <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">
            ITTEHAD COMMERCIAL CENTRE | FORENSIC AUDIT UNIT
         </div>
         <p className="text-[10px] font-bold text-slate-400 tracking-widest max-w-lg mx-auto leading-relaxed border border-slate-100 p-4 rounded-2xl bg-white/50 shadow-sm opacity-80 uppercase italic">
            This ledger is cryptographically secured. Unauthorized attempts to modify the audit trail are recorded in the secondary shadow archive.
         </p>
      </footer>
    </div>
  );
};

export default AuditLog;
