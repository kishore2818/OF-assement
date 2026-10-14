# Transaction Reconciliation System — Financial Operations Platform

A production-grade **Transaction Reconciliation and Financial Operations Platform** built for high-accuracy settlement matching, ledger balance synchronization, explainable discrepancy triage, and immutable audit trails.

---

## 📌 Executive Summary & Architecture

In modern fintech systems, internal transaction authorization records must be reconciled against subsequent processor and acquirer settlement files. This platform implements:

1. **Two-Tier Deterministic Matching Engine**:
   - **Tier 1 (Primary)**: Exact matching via `lifecycle_id`.
   - **Tier 2 (Fallback Composite Key)**: Fallback matching via `account_id` + `merchant_name` + `transaction_date`.
   - Guaranteed non-association on `FAILED` or `DECLINED` transactions.
   - Ambiguous key resolution (rejects multiple candidates rather than guessing).
2. **Exact Integer-Cents Arithmetic**:
   - All financial balances and calculations are performed in integer cents to eliminate floating-point precision errors.
   - Mathematical formula:
     $$\text{Net Settled Amount} = \sum(\text{DEBIT Settlements}) - \sum(\text{CREDIT Settlements})$$
3. **Reconciliation Run History & Ingestion Tracking (Enhancement A)**:
   - Every CSV upload attempt creates an auditable record in SQLite (`reconciliation_runs`).
   - Tracks total rows read, matched, newly inserted, duplicates skipped, invalid rejected, unmatched, and duration.
   - Itemized event logs in `reconciliation_run_items`.
   - Export rejected / unmatched records as CSV.
   - **Upload Frequency Indicator**: Shows exactly how many times files have been uploaded, with click-to-view dashboard metrics for any individual run.
4. **Exception Management Center (Enhancement B)**:
   - Dedicated triage desk (`/exceptions`) for all financial discrepancies:
     - 🔴 Over-settlement (`OVER_SETTLED_CRITICAL`)
     - 🔴 Missing settlement after 7 days (`SETTLEMENT_OVERDUE_CRITICAL`)
     - 🟡 Partial settlement warning (`PARTIAL_SETTLEMENT_WARNING`)
     - 🟡 Unmatched batch records, ambiguous matches, currency mismatches
   - Operational review workflow with persistent status (`UNREVIEWED`, `UNDER_REVIEW`, `RESOLVED`) and investigation notes saved in SQLite.
5. **Interactive CSV Preview & Validation (Enhancement C)**:
   - 3-stage upload wizard: Input $\rightarrow$ Pre-Import Preview & Schema Validation $\rightarrow$ Execution Report.
   - Inspects headers, types, duplicate IDs, and potential matches before committing to the database.
6. **Explainable Matching & Chronological Timeline (Enhancements D & E)**:
   - Per-transaction and per-tranche explainable matching diagnosis.
   - Running net settled balance on each settlement event.
   - Chronological lifecycle timeline with DEBIT/CREDIT distinction.
7. **Settlement Aging & Operational Analytics (Enhancement F)**:
   - Grouping of outstanding transactions into aging bands: **0–3 days**, **4–7 days**, and **>7 days overdue**.
   - Average days to full settlement, settlement completion rate, and excess settled amounts.
8. **Filtered Exports (Enhancement G)**:
   - Download filtered transactions as CSV.
   - Download exceptions reports as CSV.
   - Download reconciliation run rejected records as CSV.
   - Download settlement history for individual transactions as CSV.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, React Router v6, Lucide Icons |
| **Backend** | Node.js (v20+), TypeScript (strict mode), Express.js, RESTful API |
| **Database** | SQLite via `better-sqlite3`, ACID transactions, relational integrity |
| **CSV Processing** | `csv-parse` (RFC-4180), Zod schema validator |
| **Testing** | Vitest (34 unit and integration tests), Supertest |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+

### 1. Backend Setup
```bash
cd backend
npm install
npm run build
npm start
# Backend server runs on http://localhost:4000
```

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend dashboard runs on http://localhost:3000
```

---

## 🧪 Automated Testing

The project includes **34 automated tests** covering all assignment scenarios and enhancement requirements:

```bash
cd backend
npm test
```

### Test Highlights:
- **Scenario 1**: Perfect Match ($100 DEBIT vs $100 Txn) $\rightarrow$ `FULLY_SETTLED`, Clean.
- **Scenario 2**: Partial Settlement ($80 DEBIT vs $100 Txn) $\rightarrow$ `PARTIAL`, Warning Flag.
- **Scenario 3**: Legitimate Refund ($100 DEBIT + $20 CREDIT vs $100 Txn) $\rightarrow$ `REFUNDED`, Clean.
- **Scenario 4**: Over-settlement ($120 DEBIT vs $100 Txn) $\rightarrow$ `OVER_SETTLED`, 🔴 Critical Issue.
- **Scenario 5**: Fallback composite key matching when `lifecycle_id` is null.
- **Scenario 6**: Multi-tranche progression ($50 DEBIT $\rightarrow$ `PARTIAL`, second $50 DEBIT $\rightarrow$ `FULLY_SETTLED`).
- **Scenario 7**: Complex refund credit calculation.
- **Scenario 8**: Overdue aged settlement (>7 days elapsed from transaction date).
- **Scenario 9**: Duplicate Import Idempotency (repeated CSV upload skips existing records without doubling totals).
- **Scenario 10**: Conflicting duplicate detection (same settlement ID with different data rejected).
- **Scenario 11**: Ambiguous match protection (multiple candidates flagged without guessing).
- **Scenario 12**: Currency mismatch quarantine.
- **Scenario 13**: Failed/Declined transaction exclusion.
- **Scenario 14**: Pre-import CSV preview without touching SQLite database.
- **Scenario 15**: Reconciliation run audit tracking and rejected records export.
- **Scenario 16**: Exception review workflow and investigation notes persistence in SQLite.
- **Scenario 17**: Operational aging bands (0-3d, 4-7d, >7d).
- **Scenario 18-34**: Comprehensive REST API endpoints and error boundary tests.

---

## 📡 REST API Reference

### Core Reconciliation Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/reconcile` | Ingests CSV file/text, reconciles ledger, records run audit |
| `POST` | `/reconcile/preview` | Validates and previews CSV without database mutations |
| `POST` | `/reconcile/reset` | Resets SQLite database to clean seeded initial state |

### Reconciliation Runs & Audit History
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/reconciliation-runs` | Returns paginated list of all previous reconciliation runs |
| `GET` | `/reconciliation-runs/:id` | Returns run details and itemized audit events |
| `GET` | `/reconciliation-runs/:id/export-rejected` | Downloads CSV of rejected/unmatched records |

### Transactions & Settlements
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/transactions` | List transactions with filters (`status`, `severity`, `search`, `evaluationDate`) |
| `GET` | `/transactions/export` | Downloads active filtered transactions as CSV |
| `GET` | `/transactions/:id` | Detailed transaction dossier with timeline, settlements, and formulas |
| `GET` | `/transactions/:id/export-settlements` | Downloads settlement history for specific transaction as CSV |
| `GET` | `/settlements` | Direct list of all settlement records |

### Exception Management Center
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/exceptions` | List financial exceptions with triage filters |
| `GET` | `/exceptions/:id` | Exception detail with formula, linked transaction, and diagnosis |
| `PATCH` | `/exceptions/:id/review` | Updates review status (`UNREVIEWED`, `UNDER_REVIEW`, `RESOLVED`) and notes |
| `GET` | `/exceptions/export` | Downloads filtered exceptions report as CSV |

### Analytics & Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | Real-time KPI totals, status breakdowns, and aging bands |
| `GET` | `/health` | Health check endpoint |

---

## 🗄️ Database Schema

### `transactions`
- `transaction_id`: VARCHAR(50) PRIMARY KEY
- `lifecycle_id`: VARCHAR(50)
- `account_id`: VARCHAR(50) NOT NULL
- `merchant_name`: VARCHAR(100) NOT NULL
- `transaction_date`: DATE NOT NULL
- `transaction_amount`: DECIMAL(10,2) NOT NULL
- `currency`: VARCHAR(3) NOT NULL
- `status`: VARCHAR(20) NOT NULL
- `settlement_status`: VARCHAR(20) DEFAULT 'PENDING'
- `total_settled_amount`: DECIMAL(10,2) DEFAULT 0.00
- `last_settlement_date`: DATE
- `created_at`: TIMESTAMP

### `settlement_history`
- `settlement_id`: VARCHAR(50) PRIMARY KEY
- `transaction_id`: VARCHAR(50) REFERENCES transactions(transaction_id)
- `lifecycle_id`: VARCHAR(50)
- `settlement_date`: DATE NOT NULL
- `settlement_amount`: DECIMAL(10,2) NOT NULL
- `settlement_type`: VARCHAR(10) NOT NULL ('DEBIT' or 'CREDIT')
- `currency`: VARCHAR(3) NOT NULL
- `run_id`: VARCHAR(50) REFERENCES reconciliation_runs(run_id)
- `match_method`: VARCHAR(30) ('PRIMARY_LIFECYCLE' or 'FALLBACK_COMPOSITE')
- `processed_at`: TIMESTAMP

### `reconciliation_runs`
- `run_id`: VARCHAR(50) PRIMARY KEY
- `file_name`: VARCHAR(255) NOT NULL
- `file_size_bytes`: INTEGER DEFAULT 0
- `status`: VARCHAR(20) NOT NULL ('COMPLETED', 'PARTIAL', 'FAILED')
- `records_read`: INTEGER
- `matched_records`: INTEGER
- `new_settlements_inserted`: INTEGER
- `duplicates_skipped`: INTEGER
- `invalid_records`: INTEGER
- `unmatched_records`: INTEGER
- `transactions_updated`: INTEGER
- `duration_ms`: INTEGER
- `error_message`: TEXT
- `created_at`: TIMESTAMP

### `reconciliation_run_items`
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `run_id`: VARCHAR(50) REFERENCES reconciliation_runs(run_id)
- `row_number`: INTEGER
- `settlement_id`: VARCHAR(50)
- `item_type`: VARCHAR(20) ('MATCHED', 'SKIPPED_DUPLICATE', 'INVALID', 'CONFLICT', 'UNMATCHED', 'AMBIGUOUS')
- `reason`: TEXT
- `raw_data`: TEXT
- `created_at`: TIMESTAMP

### `exception_reviews`
- `exception_id`: VARCHAR(100) PRIMARY KEY
- `transaction_id`: VARCHAR(50)
- `issue_code`: VARCHAR(50) NOT NULL
- `severity`: VARCHAR(20) NOT NULL
- `review_status`: VARCHAR(20) ('UNREVIEWED', 'UNDER_REVIEW', 'RESOLVED')
- `notes`: TEXT
- `reviewed_by`: VARCHAR(50)
- `updated_at`: TIMESTAMP
- `created_at`: TIMESTAMP

---

## 🎬 End-to-End Demo Flow

1. **Dashboard Overview**:
   - View top KPI cards, including **CSV Uploads Count** indicator.
   - Inspect the **Reconciliation Upload Batches** table.
   - Click on any upload row to open the **Run Metrics Dossier Modal** showing exact metrics for that upload.
2. **Pre-Import CSV Validation**:
   - Click **"Reconcile New Data"** in header or dashboard.
   - Choose the provided dataset, upload a file, or paste CSV records.
   - Click **"Validate & Preview CSV"** to inspect row-by-row matching diagnostics before committing.
   - Click **"Confirm & Commit Reconciliation"** to ingest.
3. **Execution Report**:
   - Review records inserted, duplicates skipped, and unmatched entries.
   - Click **"Download Rejected CSV"** if discrepancies exist.
4. **Exception Management**:
   - Navigate to **"Exceptions"** in the sidebar.
   - Filter by Critical / Warning or Review Status.
   - Click **"Investigate"** on an exception to see the exact financial formula, linked transaction, and add investigation notes.
   - Change review state to `UNDER_REVIEW` or `RESOLVED` and save.
5. **Audit Run History**:
   - Navigate to **"Upload History"** (`/runs`) to see every historical upload attempt with full statistics.
6. **Transaction Dossier & Timeline**:
   - Open any transaction to see its chronological lifecycle timeline, matching method, and export settlements CSV.
