import React from 'react';
import { FileDown, Search } from 'lucide-react';

const Wallet = () => {
  const transactions = [
    { date: '08/02/2026', debit: 50000, credit: 0, balance: 37600, desc: 'Transfer: Waseem to Admin' },
    { date: '05/02/2026', debit: 0, credit: 12400, balance: -12400, desc: 'Transfer: Khadim Hussain to Admin' },
  ];

  return (
    <div style={{padding: '24px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h2 style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Admin</h2>
          <span style={{fontSize: '0.7rem', color: '#9ca3af'}}>USERS / ADMIN</span>
        </div>
        <button style={{
          backgroundColor: '#0891b2', color: 'white', border: 'none', 
          padding: '8px 16px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
        }}>
          <FileDown size={16}/> PDF
        </button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px'}}>
        <div style={{background: '#ef4444', padding: '24px', borderRadius: '12px', color: 'white'}}>
          <div style={{opacity: 0.8, marginBottom: '8px'}}>Total Debit</div>
          <div style={{fontSize: '1.8rem', fontWeight: '700'}}>Rs. 50000</div>
        </div>
        <div style={{background: '#10b981', padding: '24px', borderRadius: '12px', color: 'white'}}>
          <div style={{opacity: 0.8, marginBottom: '8px'}}>Total Credit</div>
          <div style={{fontSize: '1.8rem', fontWeight: '700'}}>Rs. 12400</div>
        </div>
        <div style={{background: '#6366f1', padding: '24px', borderRadius: '12px', color: 'white'}}>
          <div style={{opacity: 0.8, marginBottom: '8px'}}>Balance</div>
          <div style={{fontSize: '1.8rem', fontWeight: '700'}}>Rs. 37600</div>
        </div>
      </div>

      <div style={{background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h3 style={{fontSize: '1rem'}}>Transaction History</h3>
          <div style={{display: 'flex', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
            <input type="text" placeholder="Search..." style={{padding: '8px', border: 'none', outline: 'none'}} />
            <button style={{backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '8px 16px'}}><Search size={16}/></button>
          </div>
        </div>

        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tr, i) => (
              <tr key={i}>
                <td>{tr.date}</td>
                <td style={{color: tr.debit ? '#ef4444' : ''}}>{tr.debit ? `Rs. ${tr.debit}` : ''}</td>
                <td style={{color: tr.credit ? '#10b981' : ''}}>{tr.credit ? `Rs. ${tr.credit}` : ''}</td>
                <td style={{fontWeight: '600'}}>Rs. {tr.balance}</td>
                <td>{tr.desc}</td>
                <td><FileDown size={16} color="#6366f1" style={{cursor: 'pointer'}} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px'}}>
          <span style={{color: '#9ca3af', alignSelf: 'center'}}>Previous</span>
          <button style={{width: '32px', height: '32px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px'}}>1</button>
          <span style={{color: '#9ca3af', alignSelf: 'center'}}>Next</span>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
