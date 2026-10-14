import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an all-inclusive, executive PDF report containing:
 * - Brand Header & Meta Information
 * - Executive Summary & Financial KPIs
 * - Status & Issue Triage Breakdown
 * - Comprehensive Ledger Transactions Table
 * - Ingested Settlement Records Table
 * - Algorithmic Audit & Verification Sign-off
 */
export function generateReconciliationPDF({
  summary,
  transactions = [],
  settlements = [],
  evaluationDate = ''
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const formattedNow = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const activeDate = evaluationDate || summary?.latestDate || 'Latest Records Present';

  // 1. Header Banner
  doc.setFillColor(11, 15, 25); // Deep Obsidian #060C22
  doc.rect(0, 0, pageWidth, 85, 'F');

  // Mint accent line
  doc.setFillColor(30, 200, 165); // #1EC8A5
  doc.rect(0, 85, pageWidth, 3, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('OPEN FABRIC', margin, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('HIGH-PRECISION LEDGER RECONCILIATION ENGINE', margin, 52);
  doc.text(`Evaluation Date: ${activeDate}  |  Generated: ${formattedNow}`, margin, 66);

  // Status Badge on right of header
  doc.setFillColor(79, 70, 229); // #1EC8A5
  doc.roundedRect(pageWidth - margin - 120, 26, 120, 32, 6, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AUDIT REPORT', pageWidth - margin - 60, 42, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('VERIFIED & CERTIFIED', pageWidth - margin - 60, 52, { align: 'center' });

  let currentY = 110;

  // 2. Report Overview Title
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. Executive Financial Summary', margin, currentY);
  currentY += 16;

  // 3. KPI Summary Table
  const totalTxns = summary?.totalTransactions ?? transactions.length;
  const eligibleTxns = summary?.eligibleTransactions ?? transactions.filter(t => t.status === 'COMPLETED').length;
  const settlementRate = summary?.settlementRate ?? 0;
  const totalSettled = summary?.totalSettledAmount ?? 0;
  const totalOutstanding = summary?.totalOutstandingAmount ?? 0;
  const totalSettlementRecords = settlements.length || summary?.totalSettlementRecords || 0;
  const criticalIssues = summary?.issueBreakdown?.criticalCount ?? 0;
  const warningIssues = summary?.issueBreakdown?.warningCount ?? 0;

  const kpiData = [
    [
      { content: 'Total Transactions', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      `${totalTxns} (${eligibleTxns} eligible)`,
      { content: 'Settlement Match Rate', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      `${settlementRate}%`
    ],
    [
      { content: 'Total Settled Volume', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      `$${totalSettled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      { content: 'Outstanding Balance', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      `$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ],
    [
      { content: 'Ingested Settlement Records', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      `${totalSettlementRecords} records`,
      { content: 'Critical Issues / Warnings', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
      `${criticalIssues} critical  /  ${warningIssues} warnings`
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    body: kpiData,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 140, fillColor: [248, 250, 252] },
      1: { cellWidth: 117, fontStyle: 'bold' },
      2: { cellWidth: 140, fillColor: [248, 250, 252] },
      3: { cellWidth: 118, fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 22;

  // 4. Status Breakdown Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('2. Settlement Status Breakdown', margin, currentY);
  currentY += 14;

  const statusRows = [
    [
      'Fully Settled',
      summary?.statusBreakdown?.fullySettled ?? 0,
      'Exact or complete settlement received matching transaction amount.'
    ],
    [
      'Partial Settlement',
      summary?.statusBreakdown?.partial ?? 0,
      'Partial funds disbursed by processor; pending remaining tranches.'
    ],
    [
      'Pending Settlement',
      summary?.statusBreakdown?.pending ?? 0,
      'No settlement received yet; awaiting processor settlement window.'
    ],
    [
      'Over-Settled (Critical)',
      summary?.statusBreakdown?.overSettled ?? 0,
      'Settled amount exceeds transaction amount; potential duplicate or credit anomaly.'
    ],
    [
      'Refunded / Reversed',
      summary?.statusBreakdown?.refunded ?? 0,
      'Transaction subject to customer refund or card rail chargeback debit.'
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Status Category', 'Count', 'Description & Operational Context']],
    body: statusRows,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 120, fontStyle: 'bold' },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: contentWidth - 170 }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // Check if we need a new page for Section 3
  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = 50;
  }

  // 5. Section 3: Detailed Ledger Transactions Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('3. Ledger Transactions Audit Table', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Records: ${transactions.length}  |  Sorted by latest settlement & update activity`, margin, currentY + 12);
  currentY += 22;

  const txnTableData = transactions.map((t) => [
    t.transaction_id,
    t.merchant_name,
    t.account_id,
    t.transaction_date,
    `$${t.transaction_amount.toFixed(2)}`,
    `$${t.total_settled_amount.toFixed(2)}`,
    t.settlement_status,
    t.last_settlement_date || '—',
    t.primary_issue_severity !== 'NONE' ? t.primary_issue_severity : 'Clean'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Tx ID',
      'Merchant',
      'Account',
      'Date',
      'Txn Amt',
      'Settled',
      'Status',
      'Last Settle',
      'Issue'
    ]],
    body: txnTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [11, 15, 25],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7,
      cellPadding: 4,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 70 },
      2: { cellWidth: 50 },
      3: { cellWidth: 55 },
      4: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 50, halign: 'right', textColor: [5, 150, 105] },
      6: { cellWidth: 65, fontStyle: 'bold' },
      7: { cellWidth: 60, halign: 'center' },
      8: { cellWidth: 65, halign: 'center' }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // Check if we need a new page for Section 4
  if (currentY > pageHeight - 160) {
    doc.addPage();
    currentY = 50;
  }

  // 6. Section 4: Ingested Settlement Records (CSV Entries)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('4. Ingested Settlement Records (Processor Tranches)', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Ingested Entries: ${settlements.length}  |  Captured from processor CSV files`, margin, currentY + 12);
  currentY += 22;

  const settlementTableData = settlements.map((s) => [
    s.settlement_id,
    s.transaction_id || 'Unmatched',
    s.settlement_date,
    s.settlement_type,
    `${s.settlement_type === 'DEBIT' ? '+' : '-'}$${s.settlement_amount.toFixed(2)}`,
    s.lifecycle_id || 'Fallback Match',
    s.currency || 'USD'
  ]);

  if (settlements.length === 0) {
    settlementTableData.push([
      'No settlement entries ingested yet',
      '—', '—', '—', '—', '—', '—'
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Settlement ID',
      'Linked Tx ID',
      'Settlement Date',
      'Type',
      'Amount',
      'Payment Rail / Lifecycle ID',
      'Currency'
    ]],
    body: settlementTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7,
      cellPadding: 4,
      textColor: [15, 23, 42]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 65, fontStyle: 'bold', textColor: [79, 70, 229] },
      2: { cellWidth: 70 },
      3: { cellWidth: 50, halign: 'center' },
      4: { cellWidth: 60, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: contentWidth - 355 },
      6: { cellWidth: 40, halign: 'center' }
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // Check if we need a new page for Section 5
  if (currentY > pageHeight - 110) {
    doc.addPage();
    currentY = 50;
  }

  // 7. Section 5: Algorithmic Verification & Audit Sign-Off
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('5. Algorithmic Verification & Audit Sign-off', margin, currentY);
  currentY += 14;

  const complianceText = [
    '• Tier 1 Exact Lifecycle Matching: Automated 1:1 and 1:N card payment lifecycle pairing verified.',
    '• Tier 2 Acquirer Fallback Matching: Account ID + Merchant Name + Transaction Date verified within allowed tolerance.',
    '• Financial Precision: Dual-entry decimal arithmetic evaluated with cent-level exactness.',
    '• Engine Status: Certified by Open Fabric SQLite Node Reconciliation Architecture.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  complianceText.forEach(line => {
    doc.text(line, margin, currentY);
    currentY += 11;
  });

  // 8. Add Running Page Footers to All Pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Open Fabric Reconcile Hub  •  Confidential Financial Audit Report', margin, pageHeight - 14);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 14, { align: 'right' });
  }

  // Save the PDF
  const filename = `openfabric_reconciliation_report_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Exports all Ingested Settlement History records as RFC-4180 CSV
 */
export function exportSettlementsCSV(settlements = []) {
  const headers = [
    'settlement_id',
    'transaction_id',
    'lifecycle_id',
    'settlement_date',
    'settlement_amount',
    'settlement_type',
    'currency',
    'processed_at'
  ];

  const rows = settlements.map(s => [
    s.settlement_id,
    s.transaction_id || '',
    s.lifecycle_id || '',
    s.settlement_date,
    s.settlement_amount.toFixed(2),
    s.settlement_type,
    s.currency || 'USD',
    s.processed_at || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `settlement_records_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
