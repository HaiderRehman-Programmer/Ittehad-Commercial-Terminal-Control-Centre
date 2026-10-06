import { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 2) {
      const fetchSearch = async () => {
        try {
           const res = await api.get(`/search?q=${query}`);
           setResults(res.data || []);
        } catch (err) {
           console.error(err);
        }
      }
      fetchSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[10vh]">
      <div className="glass-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4 bg-white/95 border-b-0" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="text-indigo-500" size={20} />
          <input 
            type="text" 
            autoFocus 
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 text-lg placeholder-slate-400"
            placeholder="Search customers, bookings, or pages... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {results.length > 0 ? (
          <div className="max-h-96 overflow-y-auto p-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1">Found Results</div>
            {results.map((r, i) => (
              <div 
                key={i} 
                onClick={() => {
                  setIsOpen(false);
                  if(r.type === 'Customer') navigate(`/customer-ledger/${r.data.id}`);
                }}
                className="flex items-center gap-4 p-3 hover:bg-indigo-50/50 rounded-xl cursor-pointer group transition-colors"
               >
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <User size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{r.data.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Customer • {r.data.phone}</div>
                </div>
              </div>
            ))}
          </div>
        ) : query.length > 2 ? (
          <div className="p-10 text-center text-slate-400 font-medium">No results found for "{query}"</div>
        ) : (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500 justify-center">
             <span>Try searching for:</span>
             <span className="hidden sm:inline bg-white px-2 py-1 rounded shadow-sm border border-slate-200">Customer Names</span>
             <span className="hidden sm:inline bg-white px-2 py-1 rounded shadow-sm border border-slate-200">Booking Numbers</span>
             <span className="hidden sm:inline bg-white px-2 py-1 rounded shadow-sm border border-slate-200">Transactions</span>
          </div>
        )}
      </div>
    </div>
  );
};
