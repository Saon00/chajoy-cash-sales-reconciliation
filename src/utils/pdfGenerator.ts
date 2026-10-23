import { jsPDF } from 'jspdf';
import { ClosingRecord } from '../types/reconciliation';
import { formatCurrency } from './calculator';
import { CHA_JOY_LOGO_BASE64 } from './logoBase64';

// Helper for clean PDF currency text in Times Roman without Unicode glyph corruption
function formatPdfCurrency(amount: number): string {
  return formatCurrency(amount, true, 'Tk');
}

export function generateClosingPDF(record: ClosingRecord): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - (margin * 2);

  // Cha Joy Executive Palette colors
  const primaryForest = [46, 107, 66];   // #2E6B42
  const primaryMatcha = [90, 158, 111];  // #5A9E6F
  const softBg = [250, 252, 250];        // #FAFCFA
  const borderGrey = [215, 225, 218];    // #D7E1DA
  const darkText = [24, 38, 29];         // #18261D
  const mutedText = [90, 105, 95];       // #5A695F

  // Status colors
  const matchedGreen = [46, 125, 50];    // #2E7D32
  const shortageRed = [211, 47, 47];     // #D32F2F
  const surplusAmber = [230, 81, 0];     // #E65100

  let currentY = 12;

  // 1. TOP HEADER BANNER: PURE WHITE BACKGROUND WITH INVERTED (DARK/FOREST) TEXT
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

  // Embed Cha Joy Penguin Logo on top-left of the white header
  try {
    if (CHA_JOY_LOGO_BASE64) {
      doc.addImage(CHA_JOY_LOGO_BASE64, 'PNG', margin + 4, currentY + 3, 20, 20);
    }
  } catch (err) {
    console.warn('Failed to embed logo into PDF:', err);
  }

  // Brand Name & Tagline in Times Roman
  const brandTextX = margin + 27;
  doc.setTextColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(21);
  doc.text('CHA JOY', brandTextX, currentY + 11.5);

  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('ICE CREAM AND TEA  |  DAILY RECONCILIATION VOUCHER', brandTextX, currentY + 18.5);

  // Voucher ID and Shift on top right in inverted dark colors
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.text(record.id, pageWidth - margin - 8, currentY + 11.5, { align: 'right' });

  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.text(`Shift: ${record.shift || 'Full Day'}`, pageWidth - margin - 8, currentY + 18.5, { align: 'right' });

  currentY += 30;

  // 2. METADATA INFO STRIP
  doc.setFillColor(246, 249, 247);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, currentY, contentWidth, 15, 1.5, 1.5, 'FD');

  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.text('STORE BRANCH', margin + 6, currentY + 5);
  doc.text('CLOSING DATE', margin + 65, currentY + 5);
  doc.text('MANAGER IN-CHARGE', margin + 110, currentY + 5);
  doc.text('RECONCILED AT', pageWidth - margin - 6, currentY + 5, { align: 'right' });

  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text(record.storeBranch, margin + 6, currentY + 11);
  doc.text(record.closingDate, margin + 65, currentY + 11);
  doc.text(record.managerName || 'Store In-Charge', margin + 110, currentY + 11);

  const timestampStr = record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB') : record.closingDate;
  doc.text(timestampStr, pageWidth - margin - 6, currentY + 11, { align: 'right' });

  currentY += 19;

  // 3. TALLY STATUS HIGHLIGHT BANNER
  let statusColor = matchedGreen;
  let statusLabel = 'TALLY MATCHED: ZERO (0) Tk VARIANCE';
  let statusDetail = 'Drawer physical cash, adjustments, and non-cash collections balance with Display Sales.';

  if (record.totals.status === 'SHORTAGE') {
    statusColor = shortageRed;
    statusLabel = `CASH SHORTAGE DETECTED: -${formatPdfCurrency(Math.abs(record.totals.difference))}`;
    statusDetail = 'Physical cash drawer falls short of expected Display Sales balance.';
  } else if (record.totals.status === 'SURPLUS') {
    statusColor = surplusAmber;
    statusLabel = `CASH SURPLUS DETECTED: +${formatPdfCurrency(record.totals.difference)}`;
    statusDetail = 'Physical cash drawer contains surplus funds over recorded Display Sales.';
  }

  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin, currentY, contentWidth, 13, 1.5, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text(statusLabel, margin + 8, currentY + 6);
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text(statusDetail, margin + 8, currentY + 10.5);

  currentY += 16;

  // 4. FINANCIAL EXECUTIVE KPI SUMMARY (5 CARDS)
  // Net Cash excluding spending = netCashSales - dailyExpenses
  const netCashExcludingSpending = Math.round((record.totals.netCashSales - record.dailyExpenses) * 100) / 100;

  const cardGap = 2.5;
  const cardWidth = (contentWidth - (cardGap * 4)) / 5;

  const kpis = [
    { label: 'DISPLAY SALES',        amount: record.displaySales,              color: darkText,      desc: 'POS Target' },
    { label: 'NET CASH SALES',        amount: record.totals.netCashSales,       color: primaryForest, desc: '(Drawer - Float) + Spending' },
    { label: 'NET CASH (EX. SPEND)',  amount: netCashExcludingSpending,          color: primaryForest, desc: 'Excl. Spending / Bazar' },
    { label: 'TOTAL NON-CASH',        amount: record.totals.totalNonCash,       color: darkText,      desc: 'Cards + MFS + Channels' },
    { label: 'TOTAL CALCULATED',      amount: record.totals.totalCalculatedSales, color: primaryForest, desc: 'Net Cash + Non-Cash' },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + (idx * (cardWidth + cardGap));
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.roundedRect(kpiX, currentY, cardWidth, 16.5, 1.5, 1.5, 'FD');

    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(6.5);
    doc.text(kpi.label, kpiX + 3, currentY + 5);

    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(9.5);
    doc.text(formatPdfCurrency(kpi.amount), kpiX + 3, currentY + 11);

    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.setFont('times', 'italic');
    doc.setFontSize(6.5);
    doc.text(kpi.desc, kpiX + 3, currentY + 14.5);
  });

  currentY += 20;

  // 5. STRUCTURED TWO-COLUMN AUDIT TABLES
  const colGap = 5;
  const leftColW = 90;
  const rightColW = contentWidth - leftColW - colGap;
  const leftColX = margin;
  const rightColX = margin + leftColW + colGap;

  // Header 1: Physical Cash
  doc.setFillColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.rect(leftColX, currentY, leftColW, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. PHYSICAL CASH DENOMINATIONS', leftColX + 4, currentY + 4.5);

  // Header 2: Non-Cash & Adjustments
  doc.setFillColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.rect(rightColX, currentY, rightColW, 6.5, 'F');
  doc.text('2. NON-CASH & CASH ADJUSTMENTS', rightColX + 4, currentY + 4.5);

  currentY += 6.5;

  // Left Column Rows: Denominations
  const denoms = [
    { label: 'Tk 1000 Note', val: 1000, count: record.denominations[1000] || 0 },
    { label: 'Tk 500 Note', val: 500, count: record.denominations[500] || 0 },
    { label: 'Tk 200 Note', val: 200, count: record.denominations[200] || 0 },
    { label: 'Tk 100 Note', val: 100, count: record.denominations[100] || 0 },
    { label: 'Tk 50 Note', val: 50, count: record.denominations[50] || 0 },
    { label: 'Tk 20 Note', val: 20, count: record.denominations[20] || 0 },
    { label: 'Tk 10 Note', val: 10, count: record.denominations[10] || 0 },
    { label: 'Tk 5 Note', val: 5, count: record.denominations[5] || 0 },
  ];

  let leftY = currentY;
  doc.setFontSize(8);

  denoms.forEach((d, idx) => {
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(247, 250, 248);
      doc.rect(leftColX, leftY, leftColW, 5.2, 'F');
    }
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont('times', 'normal');
    doc.text(d.label, leftColX + 4, leftY + 3.7);
    doc.text(`x  ${d.count}`, leftColX + 45, leftY + 3.7);
    doc.setFont('times', 'bold');
    doc.text(formatPdfCurrency(d.val * d.count), leftColX + leftColW - 4, leftY + 3.7, { align: 'right' });
    leftY += 5.2;
  });

  // Coins Row
  doc.setFillColor(240, 246, 242);
  doc.rect(leftColX, leftY, leftColW, 5.2, 'F');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'normal');
  doc.text('Coins & Small Change', leftColX + 4, leftY + 3.7);
  doc.setFont('times', 'bold');
  doc.text(formatPdfCurrency(record.denominations.coins || 0), leftColX + leftColW - 4, leftY + 3.7, { align: 'right' });
  leftY += 5.2;

  // Gross Physical Cash Total Row
  doc.setFillColor(primaryMatcha[0], primaryMatcha[1], primaryMatcha[2]);
  doc.rect(leftColX, leftY, leftColW, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('TOTAL PHYSICAL CASH', leftColX + 4, leftY + 4.5);
  doc.text(formatPdfCurrency(record.totals.totalPhysicalCash), leftColX + leftColW - 4, leftY + 4.5, { align: 'right' });
  leftY += 6.5;

  // Right Column Content: Non-Cash + Adjustments
  let rightY = currentY;
  doc.setFontSize(8);

  // Section A: Non Cash Collections
  doc.setFillColor(242, 247, 244);
  doc.rect(rightColX, rightY, rightColW, 5, 'F');
  doc.setTextColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.setFont('times', 'bold');
  doc.text('A. Non-Cash Collections', rightColX + 4, rightY + 3.6);
  rightY += 5;

  // POS Card
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'normal');
  doc.text('POS Machine Collection (Cards)', rightColX + 4, rightY + 3.7);
  doc.setFont('times', 'bold');
  doc.text(formatPdfCurrency(record.posMachine), rightColX + rightColW - 4, rightY + 3.7, { align: 'right' });
  rightY += 5.2;

  // MFS
  doc.setFillColor(247, 250, 248);
  doc.rect(rightColX, rightY, rightColW, 5.2, 'F');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'normal');
  doc.text('MFS Total (bKash / Nagad / Rocket)', rightColX + 4, rightY + 3.7);
  doc.setFont('times', 'bold');
  doc.text(formatPdfCurrency(record.mfsTotal), rightColX + rightColW - 4, rightY + 3.7, { align: 'right' });
  rightY += 5.2;

  // Dynamic Fields
  if (record.dynamicFields && record.dynamicFields.length > 0) {
    record.dynamicFields.forEach((dyn) => {
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.setFont('times', 'normal');
      doc.text(`${dyn.name || 'Custom Channel'}`, rightColX + 4, rightY + 3.7);
      doc.setFont('times', 'bold');
      doc.text(formatPdfCurrency(dyn.amount), rightColX + rightColW - 4, rightY + 3.7, { align: 'right' });
      rightY += 5.2;
    });
  }

  // Non-Cash Subtotal
  doc.setFillColor(235, 242, 237);
  doc.rect(rightColX, rightY, rightColW, 5.5, 'F');
  doc.setTextColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.setFont('times', 'bold');
  doc.text('Subtotal Non-Cash', rightColX + 4, rightY + 3.8);
  doc.text(formatPdfCurrency(record.totals.totalNonCash), rightColX + rightColW - 4, rightY + 3.8, { align: 'right' });
  rightY += 7.5;

  // Section B: Adjustments
  doc.setFillColor(242, 247, 244);
  doc.rect(rightColX, rightY, rightColW, 5, 'F');
  doc.setTextColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.setFont('times', 'bold');
  doc.text('B. Drawer Adjustments & Bazar', rightColX + 4, rightY + 3.6);
  rightY += 5;

  // Less Petty cash
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'normal');
  doc.text('Less: Opening Petty Cash (Float)', rightColX + 4, rightY + 3.7);
  doc.setFont('times', 'bold');
  doc.text(`- ${formatPdfCurrency(record.openingPettyCash)}`, rightColX + rightColW - 4, rightY + 3.7, { align: 'right' });
  rightY += 5.2;

  // Add Daily Expenses
  doc.setFillColor(247, 250, 248);
  doc.rect(rightColX, rightY, rightColW, 5.2, 'F');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'normal');
  doc.text('Add: Daily Expenses / Bazar', rightColX + 4, rightY + 3.7);
  doc.setFont('times', 'bold');
  doc.text(`+ ${formatPdfCurrency(record.dailyExpenses)}`, rightColX + rightColW - 4, rightY + 3.7, { align: 'right' });
  rightY += 5.2;

  // Net Cash Subtotal
  doc.setFillColor(primaryMatcha[0], primaryMatcha[1], primaryMatcha[2]);
  doc.rect(rightColX, rightY, rightColW, 6.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('NET CASH SALES', rightColX + 4, rightY + 4.5);
  doc.text(formatPdfCurrency(record.totals.netCashSales), rightColX + rightColW - 4, rightY + 4.5, { align: 'right' });
  rightY += 6.5;

  currentY = Math.max(leftY, rightY) + 5;

  // 6. CLOSING CASH SETTLEMENT & NEXT DAY FLOAT (EXTRA INFO)
  doc.setFillColor(245, 248, 245);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, currentY, contentWidth, 16, 1.5, 1.5, 'FD');

  doc.setTextColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('END-OF-DAY CASH SETTLEMENT & NEXT DAY FLOAT (EXTRA INFO)', margin + 6, currentY + 5);

  const thirdW = contentWidth / 3;
  // Total Cash in Drawer
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text('Total Physical Cash Count:', margin + 6, currentY + 9.5);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text(formatPdfCurrency(record.totals.totalPhysicalCash), margin + 6, currentY + 13.5);

  // Cash Withdrawal / Bank Deposit
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.text('Cash Withdrawal / Bank Deposit:', margin + thirdW + 4, currentY + 9.5);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text(formatPdfCurrency(record.cashWithdrawal || 0), margin + thirdW + 4, currentY + 13.5);

  // Next Day Petty Cash Float
  doc.setTextColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.text("Next Day's Petty Cash (Drawer Float):", margin + (thirdW * 2) + 4, currentY + 9.5);
  doc.setFontSize(9);
  doc.text(formatPdfCurrency(record.nextDayPettyCash || 0), margin + (thirdW * 2) + 4, currentY + 13.5);

  currentY += 20;

  // 7. OFFICIAL CLOSING AUDIT TRAIL — LEDGER FORMAT
  // Compute net cash excl. spending for the audit trail
  const auditNetCashExSpending = Math.round((record.totals.netCashSales - record.dailyExpenses) * 100) / 100;

  // Determine sur plus / shortage sign text
  const differenceSign = record.totals.difference >= 0 ? 'Sur Plus' : 'Shortage';
  const differenceDisplay = record.totals.difference >= 0
    ? formatPdfCurrency(record.totals.difference)
    : `- ${formatPdfCurrency(Math.abs(record.totals.difference))}`;

  // Format closing date for the header (e.g. "Oct 21")
  let closingDateShort = record.closingDate;
  try {
    const d = new Date(record.closingDate + 'T00:00:00');
    closingDateShort = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (_) {}

  // Build the two-column ledger rows
  // Left column: labels | Right column: values (right-aligned)
  const auditRows: Array<{ label: string; value: string; isBold?: boolean; isHeader?: boolean; isHighlight?: boolean }> = [
    { label: 'Cash Withdrawal (Bank / Owner)',                value: formatPdfCurrency(record.cashWithdrawal || 0) },
    { label: 'Petty Left (Next Day Float)',                   value: formatPdfCurrency(record.nextDayPettyCash || 0) },
    { label: 'Old Petty (Opening Float)',                     value: formatPdfCurrency(record.openingPettyCash) },
    { label: 'Total Cash (Physical)',                         value: formatPdfCurrency(record.totals.totalPhysicalCash), isBold: true },
    { label: 'Display Sale',                                  value: formatPdfCurrency(record.displaySales), isBold: true },
    { label: 'Sale in Cash (without spending)',               value: formatPdfCurrency(auditNetCashExSpending), isBold: true, isHighlight: true },
    { label: 'POS (Card / Machine)',                          value: formatPdfCurrency(record.posMachine) },
    { label: 'bKash / MFS',                                   value: formatPdfCurrency(record.mfsTotal) },
    { label: 'Spending (Daily Bazar / Expenses)',             value: formatPdfCurrency(record.dailyExpenses) },
    { label: differenceSign,                                  value: differenceDisplay, isBold: true, isHighlight: true },
  ];

  // Dynamic extra non-cash channels inserted before Spending
  if (record.dynamicFields && record.dynamicFields.length > 0) {
    // insert after bKash row (index 7 now) — we rebuild with splice
    record.dynamicFields.forEach((dyn, di) => {
      auditRows.splice(8 + di, 0, { label: dyn.name || 'Other Channel', value: formatPdfCurrency(dyn.amount) });
    });
  }

  const auditRowH = 5.5;
  const auditHeaderH = 8;
  const auditTotalH = auditHeaderH + (auditRows.length * auditRowH) + 2;

  doc.setFillColor(250, 252, 250);
  doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
  doc.roundedRect(margin, currentY, contentWidth, auditTotalH, 1.5, 1.5, 'FD');

  // Header
  doc.setFillColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.roundedRect(margin, currentY, contentWidth, auditHeaderH, 1.5, 1.5, 'F');
  // Re-draw bottom corners square so it looks flush with rows below
  doc.setFillColor(primaryForest[0], primaryForest[1], primaryForest[2]);
  doc.rect(margin, currentY + auditHeaderH - 3, contentWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('OFFICIAL CLOSING AUDIT — ' + closingDateShort.toUpperCase(), margin + 6, currentY + 5.5);

  currentY += auditHeaderH;

  // Ledger rows
  const labelColX = margin + 6;
  const valueColX = margin + contentWidth - 6;

  auditRows.forEach((row, idx) => {
    const rowY = currentY + (idx * auditRowH);
    // Alternate stripe
    if (idx % 2 === 1) {
      doc.setFillColor(243, 248, 245);
      doc.rect(margin, rowY, contentWidth, auditRowH, 'F');
    }
    // Highlight rows (Sale in Cash, Sur Plus/Shortage)
    if (row.isHighlight) {
      doc.setFillColor(229, 243, 234);
      doc.rect(margin, rowY, contentWidth, auditRowH, 'F');
    }

    // Label
    doc.setTextColor(row.isBold ? darkText[0] : mutedText[0], row.isBold ? darkText[1] : mutedText[1], row.isBold ? darkText[2] : mutedText[2]);
    doc.setFont('times', row.isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.text(row.label, labelColX, rowY + 3.8);

    // Value (right-aligned)
    doc.setFont('times', row.isBold ? 'bold' : 'normal');
    doc.setTextColor(row.isHighlight ? primaryForest[0] : darkText[0], row.isHighlight ? primaryForest[1] : darkText[1], row.isHighlight ? primaryForest[2] : darkText[2]);
    doc.text(row.value, valueColX, rowY + 3.8, { align: 'right' });
  });

  currentY += (auditRows.length * auditRowH) + 4;

  // 8. EXPENSE DETAILS / BAZAR MEMO
  if (record.expenseDetails) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'FD');

    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryForest[0], primaryForest[1], primaryForest[2]);
    doc.text('Daily Bazar & Expense Itemization Memo:', margin + 5, currentY + 4);

    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const splitMemo = doc.splitTextToSize(record.expenseDetails, contentWidth - 10);
    doc.text(splitMemo, margin + 5, currentY + 8);

    currentY += 15;
  }

  // 9. SIGNATURE / SIGN-OFF LINES
  currentY = Math.max(currentY, 248);
  const sigWidth = (contentWidth - 25) / 2;

  // Cashier Signature
  doc.setDrawColor(180, 195, 185);
  doc.line(margin + 5, currentY + 14, margin + 5 + sigWidth, currentY + 14);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text('Prepared By (Cashier / Shift Lead)', margin + 5, currentY + 18);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text('Physical Cash Drawer Verified & Reconciled', margin + 5, currentY + 22);

  // Manager Signature
  const sig2X = margin + sigWidth + 25;
  doc.setDrawColor(180, 195, 185);
  doc.line(sig2X, currentY + 14, sig2X + sigWidth, currentY + 14);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(`Approved By: ${record.managerName || 'Store Manager'}`, sig2X, currentY + 18);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text('Branch Manager Sign & Official Closing Stamp', sig2X, currentY + 22);

  // 10. FOOTER
  doc.setFont('times', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 155, 145);
  doc.text(
    'Cha Joy - Ice Cream and Tea • Official Daily Closing Voucher • Confidential Financial Record',
    pageWidth / 2,
    286,
    { align: 'center' }
  );

  return doc;
}

export function downloadClosingPDF(record: ClosingRecord): void {
  const doc = generateClosingPDF(record);
  const cleanDate = record.closingDate.replace(/-/g, '');
  const cleanBranch = record.storeBranch
    .replace(/Cha Joy - /i, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
  const filename = `ChaJoy_Closing_${cleanBranch}_${cleanDate}.pdf`;
  doc.save(filename);
}

export function getPDFBlobUrl(record: ClosingRecord): string {
  const doc = generateClosingPDF(record);
  return doc.output('bloburl').toString();
}
