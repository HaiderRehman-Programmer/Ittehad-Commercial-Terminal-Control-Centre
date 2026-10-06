import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email, 
        password,
        rememberMe
      });

      const { token, user } = response.data;

      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      setAuth(true);
      toast.success(`Welcome back, ${user.name || 'Admin'}!`, { icon: '👋' });
      setTimeout(() => navigate('/'), 300);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Authentication failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white overflow-hidden">
      {/* Left Panel: Hero Architectural Display */}
      <div className="hidden lg:flex lg:w-3/5 bg-slate-900 relative">
        <img 
          src="/ittehad_commercial_hero_png_1775583487331.png" 
          alt="Ittehad Commercial Centre" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 p-20 flex flex-col justify-between h-full w-full">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                 <ShieldCheck size={28} className="text-indigo-400 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white uppercase tracking-[0.3em] drop-shadow-xl">Ittehad Commercial</span>
           </div>

           <div className="max-w-xl">
              <h1 className="text-5xl font-black text-white leading-tight uppercase tracking-tight mb-6 drop-shadow-2xl">
                 Terminal <br />
                 <span className="text-indigo-400">Control</span> Centre
              </h1>
              <p className="text-slate-300 text-lg font-bold leading-relaxed mb-10 opacity-90 drop-shadow-lg">
                 The definitive administrative orchestration hub for Ittehad Real Estate Operations. Secure, immutable, and high-fidelity enterprise management.
              </p>
              
              <div className="flex items-center gap-8 border-t border-white/10 pt-10 mt-10">
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-white leading-none mb-1 uppercase">100%</span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Audit Integrity</span>
                 </div>
                 <div className="flex flex-col border-l border-white/10 pl-8">
                    <span className="text-3xl font-black text-white leading-none mb-1 uppercase">Instant</span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Global Sync</span>
                 </div>
                 <div className="flex flex-col border-l border-white/10 pl-8">
                    <span className="text-3xl font-black text-white leading-none mb-1 uppercase">Secure</span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Enterprise Access</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <Globe size={14} /> 
              <span>Global Strategic Network</span>
           </div>
        </div>
      </div>

      {/* Right Panel: Premium Authentication Form */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center items-center px-8 lg:px-20 bg-[#f8fafc] overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Form Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                  <ShieldCheck size={24} className="stroke-[2.5]" />
               </div>
               <span className="text-lg font-black text-slate-900 uppercase tracking-widest">Ittehad</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 leading-none uppercase tracking-tight mb-3">Operator Access</h2>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Authorized Credentials Required</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-shake">
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
              <p className="text-xs font-black text-rose-700 uppercase tracking-wide leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Identity Access Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <Mail size={18} strokeWidth={3} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Email or Mobile No."
                  className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] ml-1">Encryption Secret</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <Lock size={18} strokeWidth={3} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-12 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className={`w-10 h-6 rounded-full transition-all duration-300 ${rememberMe ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${rememberMe ? 'translate-x-4' : ''} shadow-sm`} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Persistent Link</span>
              </label>
              
              <Link to="/forgot-password" size={10} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all">
                Access Recovery
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  Establish Connection 
                  <LogIn size={20} className="stroke-[3] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-relaxed">
            All System Events Logged <br />
            © 2026 Admin Orchestration Suite
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
