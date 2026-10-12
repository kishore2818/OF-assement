# Transaction Reconciliation System

A production-grade **Transaction Reconciliation and Financial Operations Platform** built for high-accuracy settlement matching, ledger balance synchronization, and real-time discrepancy detection.

---

## 📌 Executive Summary & Problem Context
In financial systems, internal payment authorization records must be reconciled against subsequent banking and acquirer settlement files. This system:
1. Ingests raw settlement files (`settlement_report.csv`).
2. Implements a two-tier deterministic matching algorithm (Primary by `lifecycle_id`, Fallback by composite key `account_id` + `merchant_name` + `transaction_date`).
3. Correctly aggregates multi-tranche debit and credit settlements using exact integer-cents arithmetic.
4. Detects critical financial exceptions (over-settlements, unfulfilled settlements aged > 7 days) and warnings (under-settlements/partial payments).
5. Provides a React operations dashboard with interactive analytics, transaction audit ledger, and chronological lifecycle timelines.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript with JSX, Tailwind CSS, Recharts, React Router v6, Lucide Icons |
| **Backend** | Node.js (v20+), TypeScript (strict mode), Express.js, RESTful API Architecture |
| **Database** | SQLite via `better-sqlite3`, ACID transactions, relational integrity |
| **CSV Processing** | `csv-parse`, Zod data validation |
| **Testing** | Vitest (unit testing suite), Supertest (API integration testing) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+
- **SQLite3** (optional CLI, built-in bindings included)

### 1. Clone & Setup
```bash
git clone <repo-url>
cd openfabric
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run build
npm start
# Backend server runs on http://localhost:4000
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Frontend dashboard runs on http://localhost:3000
```

---

## 🧪 Automated Testing

The project includes unit and integration tests covering all 7 test scenarios specified in the take-home exercise plus edge cases (currency mismatches, duplicate idempotency, overdue items, ambiguous keys).

To execute the test suite:
```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **Scenario 1**: Perfect Match ($100 DEBIT vs $100 Txn) $\rightarrow$ `FULLY_SETTLED`, Clean.
- **Scenario 2**: Partial Settlement ($80 DEBIT vs $100 Txn) $\rightarrow$ `PARTIAL`, Warning Flag.
- **Scenario 3**: Legitimate Refund ($100 DEBIT + $20 CREDIT vs $100 Txn) $\rightarrow$ `REFUNDED`, Clean.
- **Scenario 4**: Over-settlement ($120 DEBIT vs $100 Txn) $\rightarrow$ `OVER_SETTLED`, 🔴 Critical Issue.
- **Scenario 5**: Missing Lifecycle ID $\rightarrow$ Matches via Fallback composite key.
- **Scenario 6**: Multi-Tranche Transition ($50 DEBIT $\rightarrow$ `PARTIAL`, second $50 DEBIT $\rightarrow$ `FULLY_SETTLED`).
- **Scenario 7**: Complex Refund ($100 DEBIT + $30 CREDIT $\rightarrow$ Net $70, `REFUNDED`).
- **Scenario 8**: Overdue aged settlement (>7 days elapsed from transaction date) $\rightarrow$ 🔴 Critical Issue.
- **Scenario 9**: Duplicate Import Idempotency (repeated CSV upload skips existing records without doubling totals).
- **Scenario 10**: Currency Mismatch Quarantine.

---

## 📊 Core Business Algorithms & Rules

### 1. Two-Tier Matching Logic
```text
IF record.lifecycle_id IS PRESENT:
    Match candidate WHERE lifecycle_id == record.lifecycle_id
    IF exactly 1 match: RETURN MATCHED (Primary)
    ELSE IF > 1 match: RETURN AMBIGUOUS
    ELSE: RETURN UNMATCHED
ELSE:
    Match candidate WHERE account_id == record.account_id
                      AND merchant_name == record.merchant_name
                      AND transaction_date == record.transaction_date
    IF exactly 1 match: RETURN MATCHED (Fallback)
    ELSE IF > 1 match: RETURN AMBIGUOUS
    ELSE: RETURN UNMATCHED
```

### 2. Financial Precision & Net Calculation
All calculations are performed using exact integer cents:
$$\text{total\_settled\_amount} = \sum(\text{DEBIT}) - \sum(\text{CREDIT})$$

### 3. Status Transition Hierarchy
1. No valid settlements $\rightarrow$ `PENDING`
2. Has refund credit AND net settled amount < transaction amount $\rightarrow$ `REFUNDED`
3. Net settled amount > transaction amount $\rightarrow$ `OVER_SETTLED`
4. Net settled amount == transaction amount $\rightarrow$ `FULLY_SETTLED`
5. Net settled amount < transaction amount $\rightarrow$ `PARTIAL`
6. Failed/Declined transaction status $\rightarrow$ `NOT_APPLICABLE`

### 4. Issue Detection Engine
- **🔴 Critical (Red Flag)**:
  - `OVER_SETTLED`: Net settlement exceeds transaction amount.
  - `OVERDUE_SETTLEMENT`: Eligible transaction in `PENDING` status $> 7$ days past transaction date.
- **🟡 Warning (Yellow Flag)**:
  - `PARTIAL_SETTLEMENT`: Settled balance is below transaction value (outstanding remainder).

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/reconcile` | Ingest CSV report, match, update ledger, detect issues |
| `POST` | `/reconcile/reset` | Reset database to clean initial un-reconciled state |
| `GET` | `/transactions` | List all transactions with statuses, net totals, issue flags |
| `GET` | `/transactions/:id` | Single transaction detail with settlement tranches & timeline |
| `GET` | `/dashboard/summary` | Real-time aggregate KPIs and status distributions |
| `GET` | `/transactions/export` | Download complete reconciled audit report in CSV format |

For detailed payloads and schema responses, see [docs/api.md](docs/api.md).

---

## ⚖️ Business Assumptions & Policy Notes
1. **Legitimate Refunds vs Partial Settlements**:
   - When a transaction has received credit tranches reducing the net amount below the original price, the status is classified as `REFUNDED`. In accordance with Scenario 3 of the specification, planned refunds are classified as clean operations rather than under-settlement warnings.
2. **Failed/Declined Transactions**:
   - Internal records with status `FAILED` or `DECLINED` are flagged as `NOT_APPLICABLE` and are strictly barred from accepting settlement funds. Any settlement received for a failed transaction is quarantined with an explicit compliance warning.
3. **Evaluation Date for Overdue Detection**:
   - For historical dataset batches (e.g. August 2025), the evaluation date defaults to the latest batch settlement date (`2025-08-15`) or can be configured via the UI header, ensuring consistent issue evaluation regardless of system runtime year.

---

## 🎥 2-3 Minute Live Walkthrough Guide

1. **Dashboard Initialization**:
   - Open `http://localhost:3000`. Observe the clean dashboard showing initial pending items and outstanding balance.
2. **Execute Reconciliation**:
   - Click the green **"Reconcile CSV"** button in the top navigation.
   - Select **"Exercise Provided Dataset"** (or upload `data/settlement_report.csv`).
   - Click **"Run Reconciliation"**. Observe real-time batch processing: 19 read, 16 matched/inserted, 0 duplicates, 3 quarantined.
3. **Dynamic Dashboard Refresh**:
   - Close modal. Observe instant KPI updates: Settled amount updates to $2,786.11, Settlement Rate increases to 41.7%, Status Distribution and Risk Composition charts reflect real data.
4. **Transactions Ledger**:
   - Click **"Transactions"** in the navbar.
   - Filter by status (`Over Settled`, `Refunded`, `Critical Issue`).
   - Search for `Walmart` or `Amazon`.
5. **Drill Down to Details & Timeline**:
   - Click into `TXN007` (Walmart): view Critical Over-settlement alert and recommendation.
   - Click into `TXN004` (Best Buy): view multi-tranche ledger (DEBIT + CREDIT) and chronological event timeline.
6. **Reset Demonstrator**:
   - Click **"Reset DB"** in the navbar to wipe settlements and restore clean baseline for subsequent runs.
