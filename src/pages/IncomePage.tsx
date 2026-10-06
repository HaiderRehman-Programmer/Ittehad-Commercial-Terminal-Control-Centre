import { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw,
  CreditCard,
  Send,
  Layers,
  Hash,
  Tag,
  FileText
} from 'lucide-react';
import { useModal } from '../components/Modal';
import SkeletonTable from '../components/SkeletonTable';
import toast from 'react-hot-toast';
import AccountForm from '../components/forms/AccountForm';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';
import { generateStrategicPDF } from '../utils/reportUtils';

const IncomePage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    document.title = "Income | Real Estate";
    fetchData();
  }, [categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = categoryFilter 
        ? `/accounts?type=income&category=${categoryFilter}`
        : '/accounts?type=income';
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData([]); 
    } finally {
      setLoading(false);
    }
  };

  const { openModal } = useModal();

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this income account?')) {
      toast.success(`Income account #${id} deleted successfully`);
      // Optimistic UI
      setData(data.map(item => item.id === id ? { ...item, deleted: true } : item));
    }
  };

  const handleRestore = (id: number) => {
    if (window.confirm('Are you sure you want to restore this income account?')) {
      toast.success(`Income account #${id} restored successfully`);
      // Optimistic UI
      setData(data.map(item => item.id === id ? { ...item, deleted: false } : item));
    }
  };
  const filteredData = data.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );
 
  const handleExportPDF = () => {
    const headers = ['Account Code', 'Account Name', 'Category', 'Status'];
    const body = filteredData.map(item => [
      item.code,
      item.name.toUpperCase(),
      item.category.toUpperCase(),
      item.deleted ? 'RETIRED' : 'ACTIVE'
    ]);

    generateStrategicPDF({
      title: 'Income Portfolio Archive',
      subtitle: `Scope: ${categoryFilter || 'All Categories'} | Matches: ${filteredData.length}`,
      headers,
      body,
      filename: `income_accounts_${new Date().getTime()}.pdf`
    });
  };

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Income</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">Income</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#333] leading-tight">Income</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-md text-[13px] font-bold transition-colors shadow-sm"
          >
            <FileText size={16} /> 
            <span>Strategic Export</span>
          </button>
          <button 
            onClick={() => toast('Categories management coming soon', { icon: 'ℹ️' })}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-md text-[13px] font-bold transition-colors shadow-sm"
          >
            <Layers size={16} /> 
            <span>Categories</span>
          </button>
          <button 
            onClick={() => openModal('Create Income Account', <AccountForm type="income" onRefresh={fetchData} />)}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-4 py-2 rounded-md text-[13px] font-bold transition-colors shadow-sm"
          >
            <Plus size={16} /> 
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Category Filter */}
        <div className="w-full md:w-64">
           <label className="block text-[12px] font-bold text-slate-700 mb-1 uppercase tracking-wider">Category</label>
           <select 
             className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5D78FF] font-medium text-slate-700 shadow-sm"
             value={categoryFilter}
             onChange={(e) => setCategoryFilter(e.target.value)}
           >
             <option value="">All Categories</option>
             <option value="uncategorized">Uncategorized</option>
           </select>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-auto mt-auto relative">
           <input 
              type="text"
              placeholder="Search Accounts..."
              className="form-control w-full min-w-[250px] bg-white border border-slate-200 rounded-md pl-3 pr-10 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5D78FF] shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
           <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#5D78FF]">
              <Search size={16} />
           </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <SkeletonTable rows={5} columns={3} />
        ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider w-[150px]">Code</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-[12px] font-bold text-[#333] uppercase tracking-wider text-center w-[150px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className={`border-b border-slate-50 hover:bg-slate-50/10 transition-colors last:border-0 hover:shadow-sm ${item.deleted ? 'opacity-60 bg-slate-50' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                     <Hash size={14} className="text-slate-400" />
                     {item.deleted ? <del>{item.code}</del> : item.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <div className="text-[13px] font-bold text-[#5D78FF]">
                       {item.deleted ? <del className="text-slate-500">{item.name}</del> : item.name}
                     </div>
                     <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 ml-2 flex items-center gap-1">
                        <Tag size={10} />
                        {item.category}
                     </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                     {!item.deleted && (
                       <button 
                         onClick={() => openModal('Edit Income Account', <AccountForm type="income" editData={item} onRefresh={fetchData} />)}
                         className="text-amber-500 hover:bg-amber-50 p-1.5 rounded transition-colors"
                         title="Edit Account"
                       >
                         <Edit2 size={16} />
                       </button>
                     )}
                     {!item.deleted ? (
                       <button 
                         onClick={() => handleDelete(item.id)}
                         className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors"
                         title="Delete Account"
                       >
                         <Trash2 size={16} />
                       </button>
                     ) : (
                       <button 
                         onClick={() => handleRestore(item.id)}
                         className="text-teal-600 hover:bg-teal-50 p-1.5 rounded transition-colors bg-teal-50/50"
                         title="Restore Account"
                       >
                         <RefreshCw size={16} />
                       </button>
                     )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">No income accounts found.</td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Create Payment', <PaymentForm onRefresh={fetchData} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} />
      </button>
      <button 
        onClick={() => openModal('Create Transfer', <TransferForm onRefresh={fetchData} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ffc107' }}
        title="Transfer"
      >
        <Send size={24} />
      </button>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-slate-500 text-[10px] border-t border-slate-200 bg-white/50">
          COPYRIGHT &copy; 2026 | ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

export default IncomePage;
