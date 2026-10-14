const rawApiBase = import.meta.env.VITE_API_URL || '';
const API_BASE = rawApiBase ? rawApiBase.replace(/\/+$/, '') : '';

export function getAuthToken() {
  return localStorage.getItem('of_auth_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('of_auth_token', token);
  } else {
    localStorage.removeItem('of_auth_token');
  }
}

export function clearAuthToken() {
  localStorage.removeItem('of_auth_token');
  localStorage.removeItem('of_auth_user');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('of_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('of_auth_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('of_auth_user');
  }
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed. Please verify credentials.');
  }

  if (data.token) {
    setAuthToken(data.token);
    setStoredUser(data.user);
  }

  return data;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found.');

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    clearAuthToken();
    throw new Error('Session expired or unauthorized');
  }

  const data = await res.json();
  if (data.user) {
    setStoredUser(data.user);
  }
  return data.user;
}

export async function fetchSummary(evaluationDate, runId) {
  const url = new URL(`${API_BASE}/dashboard/summary`);
  if (evaluationDate) url.searchParams.set('evaluationDate', evaluationDate);
  if (runId && runId !== 'ALL') url.searchParams.set('runId', runId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`);
  return res.json();
}

export async function fetchTransactions({ status, severity, search, evaluationDate, runId } = {}) {
  const url = new URL(`${API_BASE}/transactions`);
  if (status && status !== 'ALL') url.searchParams.set('status', status);
  if (severity && severity !== 'ALL') url.searchParams.set('severity', severity);
  if (search) url.searchParams.set('search', search);
  if (evaluationDate) url.searchParams.set('evaluationDate', evaluationDate);
  if (runId && runId !== 'ALL') url.searchParams.set('runId', runId);

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

export async function previewReconciliation(fileOrText, fileName = 'settlement_upload.csv') {
  let res;
  if (fileOrText instanceof File) {
    const formData = new FormData();
    formData.append('file', fileOrText);
    res = await fetch(`${API_BASE}/reconcile/preview`, {
      method: 'POST',
      body: formData,
    });
  } else {
    res = await fetch(`${API_BASE}/reconcile/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv: fileOrText, fileName }),
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `CSV preview validation failed (${res.status})`);
  }
  return res.json();
}

export async function runReconciliation(fileOrText, fileName = 'settlement_upload.csv') {
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
      body: JSON.stringify({ csv: fileOrText, fileName }),
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Reconciliation request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchReconciliationRuns({ limit = 50, offset = 0 } = {}) {
  const url = new URL(`${API_BASE}/reconciliation-runs`);
  url.searchParams.set('limit', limit);
  url.searchParams.set('offset', offset);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch runs: ${res.statusText}`);
  return res.json();
}

export async function fetchReconciliationRunById(runId) {
  const res = await fetch(`${API_BASE}/reconciliation-runs/${encodeURIComponent(runId)}`);
  if (!res.ok) throw new Error(`Failed to fetch run ${runId}: ${res.statusText}`);
  return res.json();
}

export function getRejectedItemsExportUrl(runId) {
  return `${API_BASE}/reconciliation-runs/${encodeURIComponent(runId)}/export-rejected`;
}

export async function deleteReconciliationRun(runId) {
  const res = await fetch(`${API_BASE}/reconciliation-runs/${encodeURIComponent(runId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to delete reconciliation run: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchExceptions({ severity, reviewStatus, issueType, search, evaluationDate } = {}) {
  const url = new URL(`${API_BASE}/exceptions`);
  if (severity && severity !== 'ALL') url.searchParams.set('severity', severity);
  if (reviewStatus && reviewStatus !== 'ALL') url.searchParams.set('reviewStatus', reviewStatus);
  if (issueType && issueType !== 'ALL') url.searchParams.set('issueType', issueType);
  if (search) url.searchParams.set('search', search);
  if (evaluationDate) url.searchParams.set('evaluationDate', evaluationDate);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch exceptions: ${res.statusText}`);
  return res.json();
}

export async function fetchExceptionById(id) {
  const res = await fetch(`${API_BASE}/exceptions/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to fetch exception ${id}: ${res.statusText}`);
  return res.json();
}

export async function updateExceptionReview(id, { reviewStatus, notes, reviewedBy }) {
  const res = await fetch(`${API_BASE}/exceptions/${encodeURIComponent(id)}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewStatus, notes, reviewedBy }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to update exception review: ${res.statusText}`);
  }
  return res.json();
}

export function getExceptionsExportUrl({ severity, reviewStatus, search } = {}) {
  const url = new URL(`${API_BASE}/exceptions/export`);
  if (severity && severity !== 'ALL') url.searchParams.set('severity', severity);
  if (reviewStatus && reviewStatus !== 'ALL') url.searchParams.set('reviewStatus', reviewStatus);
  if (search) url.searchParams.set('search', search);
  return url.toString();
}

export function getFilteredTransactionsExportUrl({ status, severity, search, evaluationDate } = {}) {
  const url = new URL(`${API_BASE}/transactions/export`);
  if (status && status !== 'ALL') url.searchParams.set('status', status);
  if (severity && severity !== 'ALL') url.searchParams.set('severity', severity);
  if (search) url.searchParams.set('search', search);
  if (evaluationDate) url.searchParams.set('evaluationDate', evaluationDate);
  return url.toString();
}

export function getExportUrl() {
  return `${API_BASE}/transactions/export`;
}

export function getTransactionSettlementsExportUrl(transactionId) {
  return `${API_BASE}/transactions/${encodeURIComponent(transactionId)}/export-settlements`;
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reconcile/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

export async function fetchSettlements(runId) {
  const url = new URL(`${API_BASE}/settlements`);
  if (runId && runId !== 'ALL') url.searchParams.set('runId', runId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch settlements');
  return res.json();
}

export const getTransactions = fetchTransactions;

export async function updateTransaction(id, data) {
  const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to update transaction ${id}`);
  }
  return res.json();
}

export async function createTransaction(data) {
  const res = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create transaction');
  }
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to delete transaction ${id}`);
  }
  return res.json();
}

export async function bulkCreateTransactions(transactions) {
  const res = await fetch(`${API_BASE}/transactions/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to bulk import transactions');
  }
  return res.json();
}
