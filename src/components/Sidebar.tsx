import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, Map as MapIcon, Tag, TrendingUp, TrendingDown, 
  Briefcase, Scale, Users, Eye, Share2, CreditCard, FileText, Settings,
  ShieldCheck, ChevronRight, LogOut, Lock, RefreshCw, ShieldHalf,
  UserCheck, TreePine, Clock, Book
} from 'lucide-react';
// @ts-ignore
import PermissionWrapper from './PermissionWrapper';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }: any) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    sale: false,
    settings: false,
    reports: false,
    land: false
  });

  const toggle = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18}/>, path: '/' },
    { name: 'My Wallet', icon: <Wallet size={18}/>, path: '/wallet', roles: ['Super Admin'] },
    { name: 'Map', icon: <MapIcon size={18}/>, path: '/map' },
    { 
      name: 'Sale', 
      icon: <Tag size={18}/>, 
      section: 'sale',
      sub: [
        { name: 'Tokens', path: '/sale/tokens' },
        { name: 'Recovery Sheet', path: '/sale/recovery-sheet' },
        { name: 'New Token', path: '/sale/new-token' },
        { name: 'Bookings', path: '/sale/bookings' },
        { name: 'New Booking', path: '/sale/new-booking' }
      ] 
    },
    { name: 'Income', icon: <TrendingUp size={18}/>, path: '/income', roles: ['Super Admin', 'Income', 'Accountant'] },
    { name: 'Expense', icon: <TrendingDown size={18}/>, path: '/expense', roles: ['Super Admin', 'Expense', 'Accountant'] },
    { name: 'Assets', icon: <Briefcase size={18}/>, path: '/assets', roles: ['Super Admin', 'Accountant'] },
    { name: 'Equity', icon: <Scale size={18}/>, path: '/equity', roles: ['Super Admin', 'Accountant'] },
    { name: 'Liability', icon: <ShieldCheck size={18}/>, path: '/liability', roles: ['Super Admin', 'Accountant'] },
    { name: 'Customers', icon: <Users size={18}/>, path: '/customers' },
    { name: 'Financial Customers', icon: <Users size={18}/>, path: '/financial-customers' },
    { name: 'Visitors', icon: <Eye size={18}/>, path: '/visitors' },
    { name: 'Transfer Requests', icon: <Share2 size={18}/>, path: '/transfer-requests', roles: ['Super Admin', 'Accountant'] },
    { name: 'Pending Payments', icon: <CreditCard size={18}/>, path: '/pending-payments', roles: ['Super Admin', 'Accountant'] },
    { 
      name: 'Reports', 
      icon: <FileText size={18}/>, 
      section: 'reports',
      roles: ['Super Admin', 'Accountant'],
      sub: [
        { name: 'Decade Fiscal Archive', path: '/reports/decade-fiscal' },
        { name: 'Town Owner Profit Audit', path: '/reports/town-owner-audit' },
        { name: 'Trial Balance', path: '/reports/trial' },
        { name: 'Balance Sheet', path: '/reports/balance-sheet' },
        { name: 'Cash Flow Statement', path: '/reports/cash-flow' },
        { name: 'Income Statement', path: '/reports/income-statement' },
        { name: 'Booking Recovery Sheet', path: '/sale/recovery-sheet' },
        { name: 'Customer Recovery Sheet', path: '/customers/recovery' },
        { name: 'Customers', path: '/customers' }
      ]
    },
    { 
      name: 'Land Management', 
      icon: <MapIcon size={18}/>, 
      section: 'land',
      roles: ['Super Admin'],
      sub: [
        { name: 'Plots Registry', path: '/land-management/plots', icon: <MapIcon size={14}/> },
        { name: 'Town Owners', path: '/land-management/town-owners', icon: <Users size={14}/> },
        { name: 'Land Owners', path: '/land-management/land-owners', icon: <Users size={14}/> },
        { name: 'Customers', path: '/land-management/customers', icon: <Users size={14}/> },
        { name: 'Agents', path: '/agents', icon: <Briefcase size={14}/> }
      ] 
    },
    { 
      name: 'Settings', 
      icon: <Settings size={18}/>, 
      section: 'settings',
      roles: ['Super Admin'],
      sub: [
        { name: 'Role Management', path: '/settings/roles', icon: <ShieldHalf size={14}/> },
        { name: 'User Management', path: '/settings/users', icon: <UserCheck size={14}/> },
        { name: 'Towns', path: '/settings/towns', icon: <TreePine size={14}/> },
        { name: 'Installment Types', path: '/settings/installments', icon: <Clock size={14}/> },
        { name: 'Audit Log', path: '/audit-log', icon: <ShieldCheck size={14}/> },
        { name: 'User Guide', path: '/settings/user-guide', icon: <Book size={14}/> }
      ] 
    },
  ];

  return (
    <div className={`sidebar-fixed bg-slate-950 text-slate-400 flex flex-col transition-all duration-300 shrink-0 font-sans border-r border-slate-800 shadow-2xl overflow-hidden ${isOpen ? 'open shadow-slate-900/50' : ''}`}>
      <div className="px-4 py-8 flex items-center justify-between border-b border-slate-900 bg-slate-950 relative overflow-hidden">
        {/* Subtle background glow for logo area */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col items-center gap-3 w-full relative z-10">
           <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group hover:border-indigo-500/50 transition-all duration-500">
              <ShieldCheck size={26} className="text-indigo-400 stroke-[2.5] group-hover:scale-110 transition-transform" />
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[14px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Ittehad</span>
              <div className="text-[9px] font-black text-indigo-400 tracking-[0.2em] uppercase leading-tight mt-1 opacity-80">
                {/* @ts-ignore */}
                {import.meta.env?.VITE_APP_PROJECT_TITLE || "Terminal Control"}
              </div>
           </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute right-4 p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar bg-slate-900/50">
        {menuItems.map((item) => (
          <PermissionWrapper key={item.name} allowedRoles={(item as any).roles}>
            {item.sub ? (
              <div 
                className={`flex items-center px-4 py-3 gap-3 cursor-pointer transition-all duration-300 border-l-[3px] group
                  ${expanded[item.section!] ? 'bg-indigo-500/5 text-white border-indigo-500 shadow-[inset_4px_0_12px_rgba(99,102,241,0.05)]' : 'border-transparent hover:bg-white/5 hover:text-white'}`}
                onClick={() => toggle(item.section!)}
              >
                <div className={`transition-all duration-300 ${expanded[item.section!] ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}>
                   {item.icon}
                </div>
                <span className="flex-1 text-[13px] font-black tracking-wide uppercase opacity-80 group-hover:opacity-100">{item.name}</span>
                <ChevronRight 
                  size={14} 
                  className={`transition-all duration-300 ease-in-out ${expanded[item.section!] ? 'rotate-90 text-indigo-400' : 'opacity-20'}`}
                />
              </div>
            ) : (
              <NavLink 
                to={item.path!} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `flex items-center px-4 py-3 gap-3 cursor-pointer transition-all duration-300 border-l-[3px] group relative overflow-hidden
                  ${isActive ? 'bg-indigo-500/5 text-white border-indigo-500 shadow-[inset_4px_0_12px_rgba(99,102,241,0.05)]' : 'border-transparent hover:bg-white/5 hover:text-white'}`}
              >
                {({ isActive }) => (
                  <>
                    <div className={`transition-all duration-300 ${isActive ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'opacity-40 group-hover:opacity-100 group-hover:scale-110'}`}>
                       {item.icon}
                    </div>
                    <span className={`flex-1 text-[13px] tracking-wide uppercase transition-all ${isActive ? 'font-black opacity-100' : 'font-black opacity-70 group-hover:opacity-100'}`}>{item.name}</span>
                    {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500/10 rounded-l-full" />}
                  </>
                )}
              </NavLink>
            )}

            {item.sub && (
              <div className={`bg-black/20 overflow-hidden transition-all duration-500 ease-in-out flex flex-col ${expanded[item.section!] ? 'max-h-[800px] opacity-100 py-2 border-y border-white/5' : 'max-h-0 opacity-0 py-0 border-transparent'}`}>
                {item.sub.map(s => (
                  <NavLink 
                    key={s.name} 
                    to={s.path} 
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `flex items-center pl-12 pr-4 py-2.5 gap-3 text-[11px] cursor-pointer transition-all duration-300 relative group
                      ${isActive ? 'text-indigo-300 font-black' : 'text-slate-500 hover:text-slate-200 font-black uppercase tracking-widest'}`}
                  >
                    {({ isActive }) => (
                       <>
                         <div className={`w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-indigo-400 scale-150 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`} />
                         {('icon' in s) && <span className={`transition-transform duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'opacity-50 group-hover:scale-110'}`}>{(s as any).icon}</span>}
                         <span className="tracking-widest">{s.name}</span>
                       </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </PermissionWrapper>
        ))}
      </div>

      <div className="p-4 flex items-center justify-around border-t border-slate-900 bg-slate-950/80 backdrop-blur-sm relative z-20">
        <button className="relative group transition-all active:scale-90" title="Profile">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-800 group-hover:border-indigo-500/50 transition-all shadow-2xl">
             <img 
               src="https://i.pravatar.cc/150?u=admin_matte_44" 
               alt="Operator" 
               className="w-full h-full object-cover"
             />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </button>
        <button className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-400 hover:bg-white/5 transition-all cursor-pointer active:scale-95" title="Switch Account">
          <RefreshCw size={18} className="stroke-[2.5]" />
        </button>
        <button className="p-2.5 rounded-xl text-slate-500 hover:text-amber-400 hover:bg-white/5 transition-all cursor-pointer active:scale-95" title="Security Lock">
          <Lock size={18} className="stroke-[2.5]" />
        </button>
        <button className="p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer active:scale-95" title="Terminate Session">
          <LogOut size={18} className="stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
