const API_BASE = 'http://localhost:4000';

export async function fetchSummary(evaluationDate) {
  const url = new URL(`${API_BASE}/dashboard/summary`);
  if (evaluationDate) url.searchParams.set('evaluationDate', evaluationDate);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
  return res.json();
}

export async function fetchTransactions({ status, severity, search, evaluationDate } = {}) {
  const url = new URL(`${API_BASE}/transactions`);
  if (status && status !== 'ALL') url.searchParams.set('status', status);
  if (severity && severity !== 'ALL') url.searchParams.set('severity', severity);
  if (search) url.searchParams.set('search', search);
  if (evaluationDate) url.searchParams.set('evaluationDate', evaluationDate);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.statusText}`);
  return res.json();
}

export async function fetchTransactionById(id, evaluationDate) {
  const url = new URL(`${API_BASE}/transactions/${encodeURIComponent(id)}`);
  if (evaluationDate) url.searchParams.set('evaluationDate', evaluationDate);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch transaction ${id}: ${res.statusText}`);
  return res.json();
}

export async function runReconciliation(fileOrText) {
  let res;
  if (fileOrText instanceof File) {
    const formData = new FormData();
    formData.append('file', fileOrText);
    res = await fetch(`${API_BASE}/reconcile`, {
      method: 'POST',
      body: formData,
    });
  } else {
    res = await fetch(`${API_BASE}/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: fileOrText }),
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Reconciliation request failed (${res.status})`);
  }
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reconcile/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

export function getExportUrl() {
  return `${API_BASE}/transactions/export`;
}

export async function fetchSettlements() {
  const res = await fetch(`${API_BASE}/settlements`);
  if (!res.ok) throw new Error('Failed to fetch settlements');
  return res.json();
}
