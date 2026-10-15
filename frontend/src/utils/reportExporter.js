import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// OpenFabric Crest Logo (base64 PNG)
const OPENFABRIC_LOGO_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAE8AAABZCAYAAAB/u3kAAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAydpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDkuMS1jMDAyIDc5LmE2YTYzOTY4YSwgMjAyNC8wMy8wNi0xMTo1MjowNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjEyIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMDQxMUM0RDIyQTIxMUYwOUIzRENEOERDMjkxRkJGQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMDQxMUM0RTIyQTIxMUYwOUIzRENEOERDMjkxRkJGQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjMwNDExQzRCMjJBMjExRjA5QjNEQ0Q4REMyOTFGQkZCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjMwNDExQzRDMjJBMjExRjA5QjNEQ0Q4REMyOTFGQkZCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+MikESQAAEYhJREFUeNrs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';

/**
 * Generates an all-inclusive, executive PDF report containing:
 * - Brand Header & Meta Information with OpenFabric Crest
 * - Executive Summary & Financial KPIs
 * - Status & Issue Triage Breakdown with visual color coding
 * - Comprehensive Ledger Transactions Table with colored status badges
 * - Ingested Settlement Records Table with color-differentiated tranches
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
  doc.setFillColor(11, 15, 25); // Deep Obsidian #0B0F19
  doc.rect(0, 0, pageWidth, 85, 'F');

  // Mint accent line
  doc.setFillColor(30, 200, 165); // #1EC8A5
  doc.rect(0, 85, pageWidth, 3, 'F');

  // OpenFabric Crest Logo embedded directly in header inside a clean white badge
  try {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 18, 48, 48, 8, 8, 'F');
    doc.addImage('data:image/png;base64,' + OPENFABRIC_LOGO_BASE64, 'PNG', margin + 6, 22, 36, 40);
  } catch (e) {
    console.warn('Could not embed crest logo in PDF', e);
  }

  // Brand Name & Subtitle
  const brandX = margin + 58;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('OPEN FABRIC', brandX, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('HIGH-PRECISION LEDGER RECONCILIATION ENGINE', brandX, 50);
  doc.text(`Evaluation Date: ${activeDate}  |  Generated: ${formattedNow}`, brandX, 64);

  // Status Badge on right of header
  doc.setFillColor(79, 70, 229); // #4F46E5
  doc.roundedRect(pageWidth - margin - 120, 26, 120, 32, 6, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AUDIT REPORT', pageWidth - margin - 60, 41, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('VERIFIED & CERTIFIED', pageWidth - margin - 60, 51, { align: 'center' });

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
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const val = String(data.cell.raw);
        if (val.includes('Fully Settled')) {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald
        } else if (val.includes('Partial')) {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        } else if (val.includes('Over-Settled')) {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        } else if (val.includes('Refunded')) {
          data.cell.styles.textColor = [147, 51, 234]; // Purple
        } else if (val.includes('Pending')) {
          data.cell.styles.textColor = [100, 116, 139]; // Slate
        }
      }
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
      8: { cellWidth: 65, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 6) {
          const val = String(data.cell.raw);
          if (val === 'FULLY_SETTLED') {
            data.cell.styles.textColor = [5, 150, 105]; // Emerald
          } else if (val === 'PARTIALLY_SETTLED' || val === 'PARTIAL') {
            data.cell.styles.textColor = [217, 119, 6]; // Amber
          } else if (val === 'OVER_SETTLED') {
            data.cell.styles.textColor = [225, 29, 72]; // Red
          } else if (val === 'REFUNDED') {
            data.cell.styles.textColor = [147, 51, 234]; // Purple
          } else {
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
        if (data.column.index === 8) {
          const val = String(data.cell.raw);
          if (val === 'CRITICAL') {
            data.cell.styles.textColor = [225, 29, 72]; // Red
          } else if (val === 'WARNING') {
            data.cell.styles.textColor = [217, 119, 6]; // Amber
          } else {
            data.cell.styles.textColor = [5, 150, 105]; // Emerald Green
          }
        }
      }
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
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 3) {
          const val = String(data.cell.raw);
          if (val === 'DEBIT') {
            data.cell.styles.textColor = [5, 150, 105]; // Emerald
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'CREDIT') {
            data.cell.styles.textColor = [147, 51, 234]; // Purple
            data.cell.styles.fontStyle = 'bold';
          }
        }
        if (data.column.index === 1 && String(data.cell.raw) === 'Unmatched') {
          data.cell.styles.textColor = [148, 163, 184];
          data.cell.styles.fontStyle = 'italic';
        }
      }
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
 * with colorful UTF-8 visual indicators for spreadsheet review
 */
export function exportSettlementsCSV(settlements = []) {
  const headers = [
    'settlement_id',
    'transaction_id',
    'lifecycle_id',
    'settlement_date',
    'settlement_amount',
    'settlement_type',
    'match_status',
    'currency',
    'processed_at'
  ];

  const rows = settlements.map(s => {
    const typeIndicator = s.settlement_type === 'DEBIT' ? '🟢 DEBIT' : '🟣 CREDIT';
    const matchIndicator = s.transaction_id ? `🟢 MATCHED (${s.transaction_id})` : '⚪ UNMATCHED';
    return [
      s.settlement_id,
      s.transaction_id || '',
      s.lifecycle_id || '',
      s.settlement_date,
      s.settlement_amount.toFixed(2),
      typeIndicator,
      matchIndicator,
      s.currency || 'USD',
      s.processed_at || ''
    ];
  });

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
