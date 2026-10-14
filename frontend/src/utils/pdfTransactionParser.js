import * as pdfjsLib from 'pdfjs-dist';

// Configure standard worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

/**
 * Extracts plain text from a File object representing a PDF
 */
export async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * Parses raw text or CSV text into an array of structured transaction objects
 * Handles CSV headers or regex patterns from PDF tables:
 * (e.g. TXN001, LC001, ACC123, Amazon.com, 2025-08-14, 125.99, USD, COMPLETED)
 */
export function parseTransactionText(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Check if first line has comma or tab separated headers
  const firstLine = lines[0].toLowerCase();
  const isDelimited = firstLine.includes(',') || firstLine.includes('\t');
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const results = [];

  if (isDelimited && (firstLine.includes('txn') || firstLine.includes('transaction') || firstLine.includes('amount') || firstLine.includes('merchant'))) {
    // Delimited header format
    const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map((p) => p.trim().replace(/^['"]|['"]$/g, ''));
      if (parts.length < 3) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] !== undefined ? parts[idx] : '';
      });

      const txnId = row.transaction_id || row['txn id'] || row.txnid || row.id || parts[0];
      const amount = row.transaction_amount || row.amount || parts[5] || parts[3] || '0';
      const merchant = row.merchant_name || row.merchant || parts[3] || 'Merchant';
      const account = row.account_id || row.account || parts[2] || 'ACC100';
      const lifecycle = row.lifecycle_id || row.lifecycle || parts[1] || null;
      const date = row.transaction_date || row.date || parts[4] || new Date().toISOString().split('T')[0];
      const currency = row.currency || 'USD';
      const status = row.status || 'COMPLETED';

      if (txnId && txnId.toUpperCase().startsWith('TXN')) {
        results.push({
          transaction_id: txnId.toUpperCase(),
          lifecycle_id: lifecycle ? lifecycle.toUpperCase() : null,
          account_id: account.toUpperCase(),
          merchant_name: merchant,
          transaction_date: date,
          transaction_amount: parseFloat(String(amount).replace(/[^0-9.-]+/g, '')) || 0,
          currency: currency.toUpperCase(),
          status: status.toUpperCase()
        });
      }
    }
  }

  // If delimited parser found items, return them
  if (results.length > 0) return results;

  // Fallback: Regex matching pattern for PDF table dumps or SQL/CSV lines
  // Looks for TXN\d+ or alphanumeric IDs, amounts, accounts, dates
  for (const line of lines) {
    // Match line pattern: TXN001, LC001, ACC123, Amazon.com, 2025-08-14, 125.99, USD, COMPLETED
    // Or SQL values: ('TXN001', 'LC001', 'ACC123', 'Amazon.com', '2025-08-14', 125.99, 'USD', 'COMPLETED', ...)
    const cleanLine = line.replace(/^[(\s]+|[);\s]+$/g, '');
    const tokens = cleanLine.split(/[,|\t]/).map((t) => t.trim().replace(/['"]/g, ''));

    if (tokens.length >= 4) {
      let txnId = null;
      let lifecycle = null;
      let account = 'ACC100';
      let merchant = '';
      let date = new Date().toISOString().split('T')[0];
      let amount = 0;
      let currency = 'USD';
      let status = 'COMPLETED';

      for (const token of tokens) {
        if (/^TXN[0-9A-Z]+/i.test(token)) {
          txnId = token.toUpperCase();
        } else if (/^LC[0-9A-Z]+/i.test(token)) {
          lifecycle = token.toUpperCase();
        } else if (/^ACC[0-9A-Z]+/i.test(token)) {
          account = token.toUpperCase();
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(token)) {
          date = token;
        } else if (/^(USD|EUR|GBP|CAD)$/i.test(token)) {
          currency = token.toUpperCase();
        } else if (/^(COMPLETED|PENDING|FAILED|DECLINED)$/i.test(token)) {
          status = token.toUpperCase();
        } else {
          const num = parseFloat(token.replace(/[^0-9.-]+/g, ''));
          if (!isNaN(num) && num > 0 && amount === 0 && (token.includes('.') || /^\d+$/.test(token))) {
            amount = num;
          } else if (token.length > 1 && !merchant) {
            merchant = token;
          }
        }
      }

      if (txnId && amount > 0) {
        results.push({
          transaction_id: txnId,
          lifecycle_id: lifecycle,
          account_id: account,
          merchant_name: merchant || 'Unknown Merchant',
          transaction_date: date,
          transaction_amount: amount,
          currency,
          status
        });
      }
    }
  }

  return results;
}
