import React from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../lib/api';
import { Printer } from 'lucide-react';

const generateReceipt = async (transactionId) => {
  try {
    const res = await api.get(`/receipt/${transactionId}`);
    const data = res.data;

    const doc = new jsPDF();
    
    // --- Header ---
    doc.setFillColor(51, 51, 51);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("ITTEHAD COMMERCIAL", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Real Estate Management ERP System", 105, 28, { align: 'center' });
    
    // --- Receipt Info ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("PAYMENT RECEIPT", 105, 55, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Receipt No: RCT-${data.id}-${Math.floor(Math.random()*1000)}`, 14, 70);
    doc.text(`Date: ${data.date}`, 14, 75);
    doc.text(`Transaction ID: TXN-${data.id}`, 14, 80);
    
    // --- Customer Info Table ---
    autoTable(doc, {
      startY: 90,
      head: [['CUSTOMER INFORMATION', 'PROPERTY DETAILS']],
      body: [
        [
          `Name: ${data.customer_name || 'N/A'}\nPhone: ${data.customer_phone || 'N/A'}\nCNIC: ${data.customer_cnic || 'N/A'}`,
          `Plot/Shop: ${data.plot_name || 'Generic Payment'}\nAccount: ${data.account_name || 'General'}`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [93, 120, 255] },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    // --- Payment Details Table ---
    const isCredit = data.credit > 0;
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Description', 'Category', 'Quantity', 'Amount (Rs.)']],
      body: [
        [data.description, data.category || 'Payment', '1', (isCredit ? data.credit : data.debit).toLocaleString()]
      ],
      theme: 'striped',
      headStyles: { fillColor: [51, 51, 51] },
      foot: [['', '', 'TOTAL PAID', `Rs. ${(isCredit ? data.credit : data.debit).toLocaleString()}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });

    // --- Footer / Signatures ---
    const finalY = doc.lastAutoTable.finalY + 30;
    
    doc.setDrawColor(200);
    doc.line(20, finalY, 70, finalY);
    doc.text("Customer Signature", 45, finalY + 5, { align: 'center' });
    
    doc.line(140, finalY, 190, finalY);
    doc.text("Authorized Signature", 165, finalY + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Note: This is a computer-generated receipt and does not require a physical stamp.", 105, 280, { align: 'center' });

    doc.save(`Receipt_${data.id}.pdf`);
  } catch (err) {
    console.error("Receipt generation failed:", err);
    toast.error('Could not generate receipt. See console.');
  }
};

export const ReceiptButton = ({ txId }) => (
  <button 
    onClick={() => generateReceipt(txId)}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-all text-[11px] font-bold"
    title="Print Official Receipt"
  >
    <Printer size={14} />
    <span>Receipt</span>
  </button>
);

export default generateReceipt;
