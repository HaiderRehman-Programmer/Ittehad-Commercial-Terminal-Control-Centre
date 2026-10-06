import { useState, useEffect } from 'react';
import { 
  CreditCard,
  Send,
  FileText,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  LineChart
} from 'lucide-react';
import api from '../lib/api';
import SkeletonTable from '../components/SkeletonTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// @ts-ignore
import { ReceiptButton } from '../components/ReceiptGenerator';
// @ts-ignore
import { useModal } from '../components/Modal';
// @ts-ignore
import PaymentForm from '../components/forms/PaymentForm';
// @ts-ignore
import TransferForm from '../components/forms/TransferForm';

const WalletAdmin = () => {
  const [summary, setSummary] = useState<any>({ totalDebit: 0, totalCredit: 0, balance: 0 });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    document.title = "Admin | Real Estate";
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sumRes = await api.get('/users/stats/1');
      if (sumRes.data) {
          setSummary({
             totalDebit: sumRes.data.totalDebit || 45000,
             totalCredit: sumRes.data.totalCredit || 75000,
             balance: sumRes.data.balance || 30000
          });
      }

      const res = await api.get('/users/transactions/1');
      setData(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      console.error(err);
      setSummary({ totalDebit: 0, totalCredit: 0, balance: 0 });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const { openModal } = useModal();

  const exportToPDF = () => {
    if (data.length === 0) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text('Transaction History - Admin', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Debit', 'Credit', 'Balance', 'Description']],
      body: data.map(t => [t.date, t.debit, t.credit, t.balance, t.description]),
      theme: 'grid',
      headStyles: { fillColor: [93, 120, 255] }
    });
    
    doc.save('admin_transactions.pdf');
  };

  const filteredData = data.filter(item => 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative pb-20">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="#" className="hover:text-[#5D78FF] transition-colors">Users</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">Admin</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#333] leading-tight">Admin</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-4 py-2 rounded-md text-[13px] font-bold transition-colors shadow-sm"
          >
            <FileText size={16} /> 
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Wallet Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-rose-500 rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
             <ArrowDownCircle size={100} />
          </div>
          <p className="text-white/90 text-[12px] font-bold uppercase tracking-wider mb-1">Total Debit</p>
          <h3 className="text-3xl font-black">Rs. {summary.totalDebit.toLocaleString()}</h3>
        </div>

        <div className="bg-emerald-500 rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
             <ArrowUpCircle size={100} />
          </div>
          <p className="text-white/90 text-[12px] font-bold uppercase tracking-wider mb-1">Total Credit</p>
          <h3 className="text-3xl font-black">Rs. {summary.totalCredit.toLocaleString()}</h3>
        </div>

        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform">
             <LineChart size={100} />
          </div>
          <p className="text-white/90 text-[12px] font-bold uppercase tracking-wider mb-1">Balance</p>
          <h3 className="text-3xl font-black">Rs. {summary.balance.toLocaleString()}</h3>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
           <h2 className="text-[15px] font-bold text-[#333]">Transaction History</h2>
           <div className="relative w-full md:w-auto">
              <input 
                 type="text"
                 placeholder="Search Transactions..."
                 className="form-control w-full min-w-[250px] bg-white border border-slate-200 rounded-md pl-3 pr-10 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#5D78FF]"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#5D78FF]">
                 <Search size={14} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Debit</th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Credit</th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-right">Balance</th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Description</th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0 hover:shadow-sm">
                  <td className="px-5 py-3 text-[12px] font-semibold text-slate-500">{item.date}</td>
                  <td className="px-5 py-3 text-[12px] font-bold text-rose-600 text-right">{item.debit > 0 ? `Rs. ${item.debit.toLocaleString()}` : '-'}</td>
                  <td className="px-5 py-3 text-[12px] font-bold text-emerald-600 text-right">{item.credit > 0 ? `Rs. ${item.credit.toLocaleString()}` : '-'}</td>
                  <td className="px-5 py-3 text-[12px] font-black text-blue-700 text-right">Rs. {item.balance.toLocaleString()}</td>
                  <td className="px-5 py-3 text-[12px] font-medium text-slate-700">{item.description}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <ReceiptButton txId={item.id} />
                       <button className="text-slate-400 hover:text-blue-500 p-1.5 rounded transition-colors" title="View Details">
                          <FileText size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">No transactions found.</td>
                </tr>
              )}
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
        <CreditCard size={24} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={fetchData} />)}
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

export default WalletAdmin;
