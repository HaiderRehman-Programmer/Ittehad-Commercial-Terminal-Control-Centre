import { useEffect } from 'react';
import { 
  Download,
  CreditCard,
  Send
} from 'lucide-react';
import { useModal } from '../components/Modal';
import PaymentForm from '../components/forms/PaymentForm';
import TransferForm from '../components/forms/TransferForm';

const UserGuide = () => {
  useEffect(() => {
    document.title = "User Guide | Real Estate";
  }, []);

  const { openModal } = useModal();

  return (
    <div className="p-6 bg-[#f4f7f6] min-h-[calc(100vh-64px)] font-sans relative">
      {/* Breadcrumb */}
      <nav className="mb-2 text-[12px] font-semibold text-[#8aa4af] flex items-center gap-2">
        <a href="/settings" className="hover:text-[#5D78FF] transition-colors">Settings</a>
        <i className="fa fa-angle-right opacity-50" style={{fontSize: '10px'}}></i>
        <small className="text-slate-400">User Guide</small>
      </nav>

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#333] leading-tight">User Guide</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.open('#', '_blank')}
            className="flex items-center gap-2 bg-[#5D78FF] hover:bg-[#4e66e6] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
          >
            <Download size={16} /> 
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white p-10 rounded-lg shadow-sm border border-slate-200 max-w-5xl mx-auto user-guide-content">
        
        {/* Brand Header */}
        <div className="flex items-center gap-8 mb-12 pb-8 border-b border-gray-100">
            <div className="h-12 bg-slate-900 px-4 py-2 rounded flex items-center justify-center border border-slate-700 shadow-inner group transition-all duration-500 hover:border-indigo-500/50">
               <span className="text-white font-black tracking-[0.3em] text-xs uppercase">ITTEHAD</span>
            </div>
           <div className="flex items-center gap-3">
             <img 
              src="https://i.pravatar.cc/150?u=ittehad_admin" 
              alt="Admin" 
              className="w-12 h-12 rounded-full border-2 border-indigo-100 shadow-md"
             />
             <div>
                <h2 className="text-xl font-bold text-[#333]">ITTEHAD COMMERCIAL CENTRE</h2>
                <p className="text-sm text-gray-500">Official Portal Guide</p>
             </div>
           </div>
        </div>

        <section className="mb-10">
          <h3 className="text-lg font-bold text-[#333] border-b pb-2 mb-4">Overview</h3>
          <p className="text-gray-600 leading-relaxed text-[14px]">
            This guide explains the full workflow of the Real Estate Management app for all roles: Super Admin, Income, Expense, User, and any custom roles. The app is organized by modules and supports day-to-day sales, collections, expenses, reporting, and account tracking.
          </p>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-bold text-[#333] border-b pb-2 mb-4">Roles and Access</h3>
          <ul className="list-disc pl-6 space-y-2 text-[14px] text-gray-600">
            <li><strong>Super Admin:</strong> Full access to all modules, towns, roles, users, reports, and dashboards.</li>
            <li><strong>Income:</strong> Focus on sales, collections, customers, tokens, bookings, installments, and income reporting.</li>
            <li><strong>Expense:</strong> Focus on expenses, expense accounts, and expense reporting.</li>
            <li><strong>User:</strong> Access based on assigned role and town permissions.</li>
            <li><strong>Custom Roles:</strong> Access controlled by permissions assigned by Super Admin.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-bold text-[#333] border-b pb-2 mb-4">Core Modules</h3>
          
          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Dashboard</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Summary cards show balances, receipts, receivables, expenses, and other key metrics.</li>
              <li>Charts display trends for revenue, bookings, collections, expenses, and recovery health.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Towns</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Create and manage towns (Super Admin only).</li>
              <li>When a town is created, system roles are generated and the creator is linked to the town.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Roles and Permissions</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Define custom roles and permissions for town users.</li>
              <li>System roles (Super Admin, Income, Expense) are protected from edit/delete.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Users</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Create users and assign roles.</li>
              <li>Each user has a wallet with a transaction history and balance summary.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Map (Plots/Shops)</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Add plots/shops manually or via CSV upload.</li>
              <li>Status flow: Available &rarr; Token &rarr; Booked &rarr; Sold.</li>
              <li>Only Available maps can be edited or deleted.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Tokens</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Reserve a plot/shop by creating a token for a customer.</li>
              <li>Token affects map status and the remaining amount.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Bookings</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Create booking from a token or directly from an available map.</li>
              <li>Support cash and installment bookings.</li>
              <li>Advance, discounts, and remaining balance are tracked automatically.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Installments</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Generate installment schedule for installment bookings.</li>
              <li>Pay installments and track paid/unpaid status.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Payments and Transfers</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Record payments for income/expense categories.</li>
              <li>Transfer money between users or accounts.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Customers</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Customer profile shows total debit, credit, balance, and transaction history.</li>
              <li>View customer bookings, tokens, and land transfers.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Accounts</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Accounts are grouped by type: Asset, Liability, Equity, Income, Expense.</li>
              <li>Account detail includes transaction history and balance summary.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Reports</h4>
            <ul className="list-disc pl-6 text-[14px] text-gray-600">
              <li>Trial Balance, Balance Sheet, Cashflow Statement, Income Statement.</li>
              <li>Recovery reports and customer recovery summaries.</li>
              <li>PDF exports available in report pages.</li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-bold text-[#333] border-b pb-2 mb-4">Key Workflows</h3>
          
          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Create Token</h4>
            <ol className="list-decimal pl-6 text-[14px] text-gray-600">
              <li>Go to Map and select an Available plot/shop.</li>
              <li>Click Create Token and fill customer, rate per unit, and token amount.</li>
              <li>Save to generate token. The map status becomes Token.</li>
            </ol>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Create Booking</h4>
            <ol className="list-decimal pl-6 text-[14px] text-gray-600">
              <li>From Map or Token, click Create Booking.</li>
              <li>Enter rate, discount, advance, and booking type (cash or installment).</li>
              <li>For installment type, set installment count and amount.</li>
              <li>Save to confirm booking. Map status becomes Booked.</li>
            </ol>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Pay Installment</h4>
            <ol className="list-decimal pl-6 text-[14px] text-gray-600">
              <li>Open Booking details and locate the Installments list.</li>
              <li>Click Pay on the desired installment.</li>
              <li>Enter payment details and submit.</li>
              <li>System updates remaining balance and installment status.</li>
            </ol>
          </div>

          <div className="mb-6">
            <h4 className="text-[16px] font-bold text-[#444] mb-2">Transfer Money (User to User)</h4>
            <ol className="list-decimal pl-6 text-[14px] text-gray-600">
              <li>Go to Transfers and choose Create.</li>
              <li>Select From User and To User, enter amount and description.</li>
              <li>Submit for approval if required.</li>
              <li>Approved transfer updates both users' wallets.</li>
            </ol>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-bold text-[#333] border-b pb-2 mb-4">Tips</h3>
          <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-600">
            <li>Always select the correct town before creating data.</li>
            <li>Use Map status to prevent double booking.</li>
            <li>Verify balances in wallet, customer, and account summaries regularly.</li>
          </ul>
        </section>

      </div>

      {/* Floating Action Buttons */}
      <button 
        onClick={() => openModal('Record Spending', <PaymentForm onRefresh={() => {}} />)}
        className="btn-payment-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ef4444' }}
        title="Payment"
      >
        <CreditCard size={24} />
      </button>
      <button 
        onClick={() => openModal('Internal Transfer', <TransferForm onRefresh={() => {}} />)}
        className="btn-transfer-top text-white shadow-lg active:scale-95 z-[9999]"
        style={{ backgroundColor: '#ffc107' }}
        title="Transfer"
      >
        <Send size={24} />
      </button>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-slate-500 text-xs border-t border-slate-200">
          Copyright &copy; 2026 | All rights reserved.
      </footer>
    </div>
  );
};

export default UserGuide;
