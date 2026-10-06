import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Standardized PDF Reporting Engine for Ittehad Commercial Centre
 */

export const generateStrategicPDF = (options) => {
  const { title = 'Strategic Report', subtitle = '', headers = [], body = [], filename = 'ittihad_report.pdf', orientation = 'portrait' } = options;

  const doc = new jsPDF({ orientation });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Branding: High-Contrast Header
  doc.setFillColor(24, 30, 41); // Slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ITTEHAD COMMERCIAL CENTRE', 14, 20);
  
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.setFont('helvetica', 'normal');
  doc.text('PREMIUM REAL ESTATE MANAGEMENT & ERP SYSTEM', 14, 28);

  // Report Title
  doc.setTextColor(24, 30, 41); // Slate-900
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 55);

  // Subtitle / Filters
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text(subtitle || `Generated on: ${new Date().toLocaleString()}`, 14, 62);

  // Table Generation
  autoTable(doc, {
    startY: 70,
    head: [headers],
    body: body,
    theme: 'grid',
    headStyles: { 
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    styles: {
      font: 'helvetica',
      lineColor: [226, 232, 240], // Slate-200
      lineWidth: 0.1
    },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {
      // Footer
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(8);
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setTextColor(150, 150, 150);
      doc.text(str, pageWidth - 25, footerY);
      doc.text('© 2026 ITTEHAD COMMERCIAL CENTRE | AUDITED INTERNAL DOCUMENT', 14, footerY);
    }
  });

  doc.save(filename);
};

/**
 * Specialized Payout Voucher Generator (Dual-Copy)
 */
export const generatePayoutVoucher = (data) => {
  const {
    agentName,
    amount,
    date,
    description,
    balanceAfter,
    authorizedBy = 'System Admin'
  } = data;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const midPoint = pageHeight / 2;

  const drawVoucher = (yOffset, copyTitle) => {
    // Header Slab
    doc.setFillColor(24, 30, 41); // Slate-900
    doc.rect(10, yOffset, pageWidth - 20, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ITTEHAD COMMERCIAL CENTRE', 15, yOffset + 12);
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('COMMISSION LIQUIDATION VOUCHER', 15, yOffset + 18);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(copyTitle.toUpperCase(), pageWidth - 45, yOffset + 15);

    // Metadata Grid
    doc.setTextColor(24, 30, 41);
    doc.setFontSize(9);
    doc.text('VOUCHER DATE:', 15, yOffset + 40);
    doc.text(date, 50, yOffset + 40);
    
    doc.text('BENEFICIARY:', 15, yOffset + 48);
    doc.text(agentName.toUpperCase(), 50, yOffset + 48);

    doc.text('LIQUIDATION AMT:', 15, yOffset + 56);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${amount.toLocaleString()}`, 50, yOffset + 56);
    doc.setFont('helvetica', 'normal');

    doc.text('REMAINING BAL:', 15, yOffset + 64);
    doc.text(`Rs. ${balanceAfter.toLocaleString()}`, 50, yOffset + 64);

    // Description Box
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yOffset + 72, pageWidth - 30, 20, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TRANSACTION NARRATIVE:', 20, yOffset + 78);
    doc.text(description || 'Standard Commission Liquidation Protocol', 20, yOffset + 85);

    // Signatures
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(24, 30, 41);
    
    // Agent Sign
    doc.line(15, yOffset + 115, 75, yOffset + 115);
    doc.text('RECIPIENT SIGNATURE', 15, yOffset + 120);
    
    // Admin Sign
    doc.line(pageWidth - 75, yOffset + 115, pageWidth - 15, yOffset + 115);
    doc.text('AUTHORIZED BY: ' + authorizedBy.toUpperCase(), pageWidth - 75, yOffset + 120);

    // Border
    doc.setDrawColor(226, 232, 240);
    doc.rect(10, yOffset, pageWidth - 20, 130);
  };

  // Draw Top Copy (Office)
  drawVoucher(10, 'Office Copy');

  // Draw Perforation Line
  doc.setLineDashPattern([2, 1], 0);
  doc.line(0, midPoint, pageWidth, midPoint);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text('---------------- DETACH HERE ----------------', pageWidth / 2 - 20, midPoint + 3);

  // Draw Bottom Copy (Agent)
  drawVoucher(midPoint + 10, 'Agent Copy');

  doc.save(`voucher_${agentName.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.pdf`);
};
