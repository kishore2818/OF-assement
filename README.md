<div align="center">

# ⚡ OpenFabric — Transaction Reconciliation & Financial Operations Platform

<p align="center">
  <strong>A high-accuracy, production-grade financial settlement reconciliation engine with explainable discrepancy triage, deterministic multi-tier matching, immutable audit trails, and enterprise JWT security.</strong>
</p>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20App-of--frontend.vercel.app-1EC8A5?style=for-the-badge&logo=vercel&logoColor=white)](https://of-frontend.vercel.app/)
[![Backend API](https://img.shields.io/badge/⚡%20Backend%20API-Render%20Online-0F1B4C?style=for-the-badge&logo=render&logoColor=white)](https://of-backend.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![JWT Security](https://img.shields.io/badge/Auth-JWT%20Bearer-black?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

---

### 🌐 Live Production Deployment

| Service | Environment | URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | Vercel Edge Global CDN | [https://of-frontend.vercel.app/](https://of-frontend.vercel.app/) | `● Active` |
| **Backend REST API** | Render Cloud Container | [https://of-backend.onrender.com](https://of-backend.onrender.com) | `● Active` |
| **API Health Probe** | Health Check Endpoint | [https://of-backend.onrender.com/health](https://of-backend.onrender.com/health) | `● Online` |

</div>

---

## 🔐 Admin Demo Credentials

Access the live platform using the pre-seeded Lead Financial Auditor account:

```yaml
Portal URL:  https://of-frontend.vercel.app/login
Email:       admin@openfabric.co
Password:    admin123
Role:        Lead Financial Auditor (admin)
Token Type:  RFC-7519 JSON Web Token (Bearer)
```

> [!NOTE]
> The platform automatically provisions the default administrator upon startup via database migrations. All authentication requests issue signed JWT tokens with 24-hour validity, securing both UI operations and REST API endpoints.

---

## 📑 Table of Contents

1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Architectural Overview & System Flow](#-architectural-overview--system-flow)
3. [Authentication & Security Architecture (JWT + CORS)](#-authentication--security-architecture-jwt--cors)
4. [Sample Datasets & Business Scenarios (Complete Reference)](#-sample-datasets--business-scenarios-complete-reference)
5. [Core Platform Features & Enhancements](#-core-platform-features--enhancements)
6. [REST API Documentation](#-rest-api-documentation)
7. [Database Schema & Entity Relationship](#-database-schema--entity-relationship)
8. [Automated Testing Suite](#-automated-testing-suite)
9. [Local Development & Quick Start](#-local-development--quick-start)
10. [Deployment & Environment Configuration](#-deployment--environment-configuration)

---

## 📌 Executive Summary & Problem Statement

In modern fintech, internal transaction authorization records must be reconciled against subsequent processor and acquirer settlement files. This platform solves the core challenges of settlement reconciliation:

1. **Two-Tier Deterministic Matching**: Resolves settlements via primary `lifecycle_id` and gracefully falls back to a composite key (`account_id` + `merchant_name` + `transaction_date`) when lifecycle IDs are omitted by acquirers.
2. **Zero Floating-Point Drift**: Employs integer-cents arithmetic throughout all ledger balance computations to eliminate standard IEEE-754 floating-point inaccuracies.
3. **Multi-Tranche Progression & Partial Refunds**: Correctly aggregates partial debit installments, credit refund adjustments, and over-settlement discrepancies.
4. **Idempotent Ingestion & Quarantine**: Prevents duplicate settlement entries while detecting and isolating conflicting record alterations.
5. **Auditable Exception Management Desk**: Delivers operational triage with persistent notes, review lifecycle statuses (`UNREVIEWED`, `UNDER_REVIEW`, `RESOLVED`), and audit tracking.

---

## 🏗️ Architectural Overview & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   OpenFabric Web Application (React 18)                │
│       Vite • Tailwind CSS • Recharts • Lucide Icons • React Router     │
│                 https://of-frontend.vercel.app/                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ CORS-Enabled HTTPS (JSON / Multipart)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Express.js + TypeScript Application Node               │
│                                                                        │
│   ┌─────────────────────┐        ┌─────────────────────────────────┐   │
│   │   Auth & JWT Svc    │        │  Two-Tier Deterministic Engine  │   │
│   │ (bcrypt / Bearer)   │        │   (Tier 1 Primary / Fallback)   │   │
│   └──────────┬──────────┘        └────────────────┬────────────────┘   │
│              │                                    │                    │
│   ┌──────────▼──────────┐        ┌────────────────▼────────────────┐   │
│   │ Reconciliation Svc  │ ◄────► │  Integer-Cents Ledger Calculator│   │
│   │ (csv-parse / Zod)   │        │     (Debit - Credit Balance)    │   │
│   └──────────┬──────────┘        └────────────────┬────────────────┘   │
│              │                                    │                    │
│   ┌──────────▼──────────┐        ┌────────────────▼────────────────┐   │
│   │ Exception Triage Svc│ ◄────► │ Operational Aging & Issue Engine│   │
│   │ (Review LifeCycle)  │        │  (0-3d, 4-7d, >7d Overdue SLA)  │   │
│   └─────────────────────┘        └─────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Atomic Transactions (PRAGMA foreign_keys = ON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SQLite Database (better-sqlite3 Engine)              │
│                                                                        │
│   ┌───────────────────────┐             ┌──────────────────────────┐   │
│   │     transactions      │ 1 ◄─────── N│    settlement_history    │   │
│   └───────────┬───────────┘             └─────────────┬────────────┘   │
│               │ 1                                     │ N              │
│               ▼ N                                     ▼ 1              │
│   ┌───────────────────────┐             ┌──────────────────────────┐   │
│   │   exception_reviews   │             │   reconciliation_runs    │   │
│   └───────────────────────┘             └─────────────┬────────────┘   │
│                                                       │ 1              │
│                                                       ▼ N              │
│                                         ┌──────────────────────────┐   │
│                                         │ reconciliation_run_items │   │
│                                         └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Authentication & Security Architecture (JWT + CORS)

### 1. Enterprise JWT Authentication Flow

The system implements secure session management compliant with RFC-7519:

```
[Auditor Client]                      [Auth Controller]                  [Database]
       │                                     │                                │
       │─── 1. POST /auth/login ────────────►│                                │
       │    { email, password }              │─── 2. Query user by email ────►│
       │                                     │◄── 3. Return password hash ────│
       │                                     │
       │                                     │─── 4. bcrypt.compareSync()
       │                                     │─── 5. jwt.sign(payload, secret)
       │                                     │
       │◄── 6. 200 OK + JWT Bearer Token ────│
       │    { token, user: { role, email } } │
       │
       │─── 7. GET /auth/me ────────────────►│
       │    Header: Authorization: Bearer <T>│─── 8. Verify JWT & Return Role
```

- **Password Storage**: Passwords hashed using `bcryptjs` with 10 salt rounds.
- **Payload Schema**: Signed claims include `id`, `email`, `name`, and `role`.
- **Session Expiry**: Configured for 24-hour token longevity.
- **Client Guard**: Protected routes enforce valid session status, redirecting unauthorized users directly to `/login`.

### 2. Cross-Origin Resource Sharing (CORS) Configuration

To enable seamless, secure communication between the Vercel-hosted frontend (`https://of-frontend.vercel.app`) and the Render-hosted backend API (`https://of-backend.onrender.com`), the backend applies Express CORS middleware:

```typescript
// backend/src/app.ts & backend/src/config/index.ts
import cors from 'cors';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

#### CORS Security Checklist:
- **Preflight Support**: Gracefully responds to HTTP `OPTIONS` requests across all routes.
- **Header Permissions**: Allows `Authorization: Bearer <token>` and `Content-Type: application/json`, `multipart/form-data`.
- **Environment Driven**: `CORS_ORIGIN` configurable in production to restrict domains when required.
- **Frontend Fallback**: The client dynamically checks `VITE_API_URL` and trims trailing slashes, ensuring no broken URL paths.

---

## 📊 Sample Datasets & Business Scenarios (Complete Reference)

All sample scenarios are pre-packaged as individual CSV files in the repository root and can be tested immediately in the UI or via REST endpoints.

### Summary Matrix of Scenarios

| Scenario | Target Txn | Amount | Settlement File | Settlement Rows | Matching Mechanism | Resulting Status | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Scenario 1** | `TXN001` | $125.99 | `scenario_1.csv` | 1 DEBIT ($125.99) | Tier 1 (`LC001`) | `FULLY_SETTLED` | `CLEAR` 🟢 |
| **Scenario 2** | `TXN003` | $45.30 | `scenario_2.csv` | 1 DEBIT ($35.30) | Tier 1 (`LC003`) | `PARTIAL` | `WARNING` 🟡 |
| **Scenario 3** | `TXN004` | $899.99 | `scenario_3.csv` | 1 DEBIT + 1 CREDIT | Tier 1 (`LC004`) | `REFUNDED` | `CLEAR` 🟢 |
| **Scenario 4** | `TXN007` | $156.78 | `scenario_4.csv` | 1 DEBIT ($180.78) | Tier 1 (`LC007`) | `OVER_SETTLED` | `CRITICAL` 🔴 |
| **Scenario 5** | `TXN013` | $32.45 | `scenario_5.csv` | 1 DEBIT (No LC) | Tier 2 Composite Fallback | `FULLY_SETTLED` | `CLEAR` 🟢 |
| **Scenario 6** | `TXN005` | $234.50 | `scenario_6.csv` | 2 DEBIT tranches | Tier 1 (`LC005`) | `PARTIAL` $\rightarrow$ `FULLY_SETTLED` | `CLEAR` 🟢 |
| **Scenario 7** | `TXN006` | $87.25 | `scenario_7.csv` | 1 DEBIT + 1 CREDIT | Tier 1 (`LC006`) | `PARTIAL` ($75.00 net) | `WARNING` 🟡 |
| **Master Batch**| Multiple | Multi | `all_scenarios_1_to_7.csv`| 10 records | Multi-Tier Engine | Batch Reconciled | Mixed |

---

### Detailed Scenario Breakdown & Raw CSV Data

#### 📁 Scenario 1: Exact 1-to-1 Match (`scenario_1.csv`)
- **Business Logic**: Normal transaction settled in full by processor via matching `lifecycle_id`.
- **Calculation**: $\$125.99 \text{ (Debit)} - \$0.00 = \$125.99 \equiv \text{Transaction Amount}$.
- **Result**: `settlement_status = FULLY_SETTLED`, Severity: `CLEAR` 🟢.

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET001,LC001,ACC123,Amazon.com,2025-08-14,2025-08-15,125.99,DEBIT,USD
```

---

#### 📁 Scenario 2: Partial Under-Settlement (`scenario_2.csv`)
- **Business Logic**: Transaction authorized for $\$45.30$, but processor only remitted $\$35.30$.
- **Calculation**: $\$35.30 \text{ (Debit)} < \$45.30 \text{ (Expected)}$. Discrepancy: $-\$10.00$.
- **Result**: `settlement_status = PARTIAL`, Severity: `WARNING` 🟡.

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET003,LC003,ACC125,Shell Gas,2025-08-14,2025-08-15,35.30,DEBIT,USD
```

---

#### 📁 Scenario 3: Legitimate Refund & Net Balance (`scenario_3.csv`)
- **Business Logic**: Customer purchase for $\$899.99$ followed by a partial return of $\$20.00$.
- **Calculation**:
  $$\text{Net Settled} = \$899.99 \text{ (DEBIT)} - \$20.00 \text{ (CREDIT)} = \$879.99$$
- **Result**: `settlement_status = REFUNDED`, Severity: `CLEAR` 🟢 (Legitimate return, not flagged as discrepancy).

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET004,LC004,ACC126,Best Buy,2025-08-14,2025-08-15,899.99,DEBIT,USD
SET005,LC004,ACC126,Best Buy,2025-08-14,2025-08-15,20.00,CREDIT,USD
```

---

#### 📁 Scenario 4: Critical Over-Settlement Discrepancy (`scenario_4.csv`)
- **Business Logic**: Transaction authorized for $\$156.78$, but processor deposited $\$180.78$.
- **Calculation**: $\$180.78 \text{ (Debit)} > \$156.78 \text{ (Txn Amount)}$. Excess: $+\$24.00$.
- **Result**: `settlement_status = OVER_SETTLED`, Severity: `CRITICAL` 🔴. Generates an exception dossier entry in `/exceptions`.

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET009,LC007,ACC129,Walmart,2025-08-14,2025-08-15,180.78,DEBIT,USD
```

---

#### 📁 Scenario 5: Missing Lifecycle ID / Composite Fallback Matching (`scenario_5.csv`)
- **Business Logic**: Acquirer settlement file has an empty `lifecycle_id`. The engine falls back to matching composite key: `account_id` (`ACC135`) + `merchant_name` (`Corner Deli`) + `transaction_date` (`2025-08-14`).
- **Result**: Successfully resolved to `TXN013`, `settlement_status = FULLY_SETTLED`, Match Method: `FALLBACK_COMPOSITE`.

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET014,,ACC135,Corner Deli,2025-08-14,2025-08-15,32.45,DEBIT,USD
```

---

#### 📁 Scenario 6: Multi-Tranche Progressive Settlement (`scenario_6.csv`)
- **Business Logic**: Large transaction ($234.50) settled in two separate tranches.
  - Tranche 1 (`SET006`): $\$150.00 \text{ DEBIT} \rightarrow$ State becomes `PARTIAL`.
  - Tranche 2 (`SET007`): $\$84.50 \text{ DEBIT} \rightarrow$ Total equals $\$234.50 \rightarrow$ Transitions to `FULLY_SETTLED`.
- **Files Included**: Both tranches in `scenario_6.csv`, or step-by-step in `scenario_6_part1.csv` and `scenario_6_part2.csv`.

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET006,LC005,ACC127,Home Depot,2025-08-14,2025-08-15,150.00,DEBIT,USD
SET007,LC005,ACC127,Home Depot,2025-08-14,2025-08-15,84.50,DEBIT,USD
```

---

#### 📁 Scenario 7: Multi-Event Settlement with Partial Credit (`scenario_7.csv`)
- **Business Logic**: Transaction authorized for $\$87.25$. Processor deposits $\$87.25$ and subsequently issues a $\$12.25$ partial return credit.
- **Calculation**: $\$87.25 \text{ (DEBIT)} - \$12.25 \text{ (CREDIT)} = \$75.00$. Net settled is under transaction total.
- **Result**: `settlement_status = PARTIAL`, Severity: `WARNING` 🟡.

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET008,LC006,ACC128,Target,2025-08-14,2025-08-15,87.25,DEBIT,USD
SET020,LC006,ACC128,Target,2025-08-14,2025-08-15,12.25,CREDIT,USD
```

---

#### 📁 Master Ingestion File: All Scenarios 1 to 7 (`all_scenarios_1_to_7.csv`)
Ingests the entire suite of settlement records in a single run:

```csv
settlement_id,lifecycle_id,account_id,merchant_name,transaction_date,settlement_date,settlement_amount,settlement_type,currency
SET001,LC001,ACC123,Amazon.com,2025-08-14,2025-08-15,125.99,DEBIT,USD
SET003,LC003,ACC125,Shell Gas,2025-08-14,2025-08-15,35.30,DEBIT,USD
SET004,LC004,ACC126,Best Buy,2025-08-14,2025-08-15,899.99,DEBIT,USD
SET005,LC004,ACC126,Best Buy,2025-08-14,2025-08-15,20.00,CREDIT,USD
SET009,LC007,ACC129,Walmart,2025-08-14,2025-08-15,180.78,DEBIT,USD
SET014,,ACC135,Corner Deli,2025-08-14,2025-08-15,32.45,DEBIT,USD
SET006,LC005,ACC127,Home Depot,2025-08-14,2025-08-15,150.00,DEBIT,USD
SET007,LC005,ACC127,Home Depot,2025-08-14,2025-08-15,84.50,DEBIT,USD
SET008,LC006,ACC128,Target,2025-08-14,2025-08-15,87.25,DEBIT,USD
SET020,LC006,ACC128,Target,2025-08-14,2025-08-15,12.25,CREDIT,USD
```

---

#### 📁 Scenarios 8–12: Integrity & Error Boundary Protection

- **Scenario 8 (Duplicate Idempotency)**: Re-uploading an identical CSV skips previously imported `settlement_id` values with zero double-counting.
- **Scenario 9 (Conflicting Duplicate Quarantine)**: If an incoming settlement shares an ID with an existing record but contains differing financial amounts, it is rejected and quarantined in `reconciliation_run_items`.
- **Scenario 10 (Ambiguous Match Protection)**: If fallback composite keys match multiple candidate transactions, the engine safely flags the row as `AMBIGUOUS` rather than guessing.
- **Scenario 11 (Currency Mismatch Quarantine)**: Settlements in mismatched currencies (e.g., EUR settlement against USD transaction) are rejected.
- **Scenario 12 (Declined / Failed Txn Exclusion)**: Transactions with status `FAILED` (`TXN015`) or `DECLINED` (`TXN016`) are strictly barred from receiving settlement funds.

---

## ✨ Core Platform Features & Enhancements

### 1. Interactive 3-Stage CSV Upload Wizard
- **Stage 1 (Select & Configure)**: Drag-and-drop CSV file or paste raw settlement CSV text directly.
- **Stage 2 (Validation Preview & Dry Run)**: Previews records, executes Zod schema validation, and identifies matched transactions with **zero database mutation**.
- **Stage 3 (Execution Report & Audit Ingestion)**: Commits the atomic batch, summarizes newly inserted, duplicates skipped, and invalid rows, and provides a direct button to **Download Rejected Records CSV**.

### 2. Exception Management Desk (`/exceptions`)
- Comprehensive discrepancy triage workspace.
- **Interactive Review Workflow**: Analysts can transition issues from `UNREVIEWED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `RESOLVED`.
- **Audit Logging**: Persists investigator identity (`reviewed_by`), markdown investigation notes, and timestamps to SQLite.

### 3. Transaction Lifecycle Dossier & Visual Timeline (`/transactions/:id`)
- Visual chronological timeline of every lifecycle event.
- Running net balance computation on each tranche.
- Explainable diagnosis banner with the exact mathematical formula.

### 4. Reconciliation Runs History (`/runs`)
- Auditable history of all previous reconciliation attempts.
- Run metrics card: duration in milliseconds, records read, matched, skipped duplicates, and duration.
- Export rejected or unmatched rows as CSV directly from any historical run.

### 5. Aging Bands & Operational Analytics
- Dynamic aging breakdown:
  - 🟢 **0–3 Days**: Active normal processing window.
  - 🟡 **4–7 Days**: Maturing transactions nearing SLA.
  - 🔴 **>7 Days**: Critical overdue settlement SLA breach.
- Average days to full settlement, completion percentage, and excess settled amounts.

### 6. Time-Travel Simulation (Evaluation Date)
- Top navigation bar includes a dynamic **Evaluation Date** selector.
- Allows financial auditors to observe ledger states and aging bands as of any historical or future date.

### 7. Instant Seed State Reset
- One-click **Reset Database** button in the header and settings page.
- Cleans and re-populates the exact baseline seeded data and migrations within 50ms.

---

## 📡 REST API Documentation

### 🔑 Authentication Endpoints
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticates auditor credentials and issues signed JWT | No |
| `GET` | `/auth/me` | Validates active session and retrieves user profile | Yes (`Bearer`) |

### ⚡ Reconciliation Endpoints
| Method | Route | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/reconcile` | Ingests CSV file/text, matches settlements, records run | Multipart / JSON |
| `POST` | `/reconcile/preview` | Validates schema & matches with zero database changes | Multipart / JSON |
| `POST` | `/reconcile/reset` | Resets SQLite database to clean seeded initial state | None |

### 📜 Reconciliation Run History
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/reconciliation-runs` | Returns paginated list of all previous reconciliation runs |
| `GET` | `/reconciliation-runs/:id` | Returns run details and itemized audit events |
| `DELETE`| `/reconciliation-runs/:id` | Removes run record and associated run items |
| `GET` | `/reconciliation-runs/:id/export-rejected` | Downloads CSV of all rejected or unmatched records |

### 💳 Transactions & Settlements
| Method | Route | Description | Filters |
| :--- | :--- | :--- | :--- |
| `GET` | `/transactions` | List all internal transactions | `status`, `severity`, `search`, `evaluationDate` |
| `GET` | `/transactions/export` | Download filtered transactions as CSV | Same as above |
| `POST` | `/transactions` | Create a single internal transaction | JSON transaction payload |
| `POST` | `/transactions/bulk` | Bulk import internal transactions | Array of transaction objects |
| `GET` | `/transactions/:id` | Detailed dossier, timeline, settlements & formulas | `evaluationDate` |
| `PUT` | `/transactions/:id` | Update transaction metadata | JSON updates |
| `DELETE`| `/transactions/:id` | Delete transaction record | None |
| `GET` | `/transactions/:id/export-settlements` | Download settlement history for specific transaction | None |
| `GET` | `/settlements` | Direct list of all settlement records | `runId` |

### ⚠️ Exceptions & Analytics
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/exceptions` | List financial exceptions with triage filters |
| `GET` | `/exceptions/:id` | Exception detail with formula and linked transaction |
| `PATCH`| `/exceptions/:id/review` | Update review status (`UNREVIEWED`, `UNDER_REVIEW`, `RESOLVED`) & notes |
| `GET` | `/exceptions/export` | Download filtered exceptions report as CSV |
| `GET` | `/dashboard/summary` | Real-time KPI totals, status breakdowns, and aging bands |
| `GET` | `/health` | Health check endpoint |

---

## 🗄️ Database Schema & Entity Relationship

The database runs on **SQLite** with strict foreign key constraints enabled (`PRAGMA foreign_keys = ON;`).

```sql
-- 1. Internal authorized transactions
CREATE TABLE transactions (
  transaction_id VARCHAR(50) PRIMARY KEY,
  lifecycle_id VARCHAR(50),
  account_id VARCHAR(50) NOT NULL,
  merchant_name VARCHAR(100) NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL,
  settlement_status VARCHAR(20) DEFAULT 'PENDING',
  total_settled_amount DECIMAL(10,2) DEFAULT 0.00,
  last_settlement_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Processor settlement ledger
CREATE TABLE settlement_history (
  settlement_id VARCHAR(50) PRIMARY KEY,
  transaction_id VARCHAR(50) REFERENCES transactions(transaction_id),
  lifecycle_id VARCHAR(50),
  settlement_date DATE NOT NULL,
  settlement_amount DECIMAL(10,2) NOT NULL,
  settlement_type VARCHAR(10) NOT NULL, -- 'DEBIT' or 'CREDIT'
  currency VARCHAR(3) NOT NULL,
  run_id VARCHAR(50) REFERENCES reconciliation_runs(run_id),
  match_method VARCHAR(30), -- 'PRIMARY_LIFECYCLE' or 'FALLBACK_COMPOSITE'
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ingestion batch runs
CREATE TABLE reconciliation_runs (
  run_id VARCHAR(50) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL, -- 'COMPLETED', 'PARTIAL', 'FAILED'
  records_read INTEGER,
  matched_records INTEGER,
  new_settlements_inserted INTEGER,
  duplicates_skipped INTEGER,
  invalid_records INTEGER,
  unmatched_records INTEGER,
  transactions_updated INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Itemized run event audit log
CREATE TABLE reconciliation_run_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id VARCHAR(50) REFERENCES reconciliation_runs(run_id),
  row_number INTEGER,
  settlement_id VARCHAR(50),
  item_type VARCHAR(20), -- 'MATCHED', 'SKIPPED_DUPLICATE', 'INVALID', 'UNMATCHED', 'AMBIGUOUS'
  reason TEXT,
  raw_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Exception reviews and investigator audit
CREATE TABLE exception_reviews (
  exception_id VARCHAR(100) PRIMARY KEY,
  transaction_id VARCHAR(50),
  issue_code VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  review_status VARCHAR(20) DEFAULT 'UNREVIEWED', -- 'UNREVIEWED', 'UNDER_REVIEW', 'RESOLVED'
  notes TEXT,
  reviewed_by VARCHAR(50) DEFAULT 'Lead Financial Auditor',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. User accounts
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Automated Testing Suite

The project includes unit and integration tests written in **Vitest** and **Supertest** covering all reconciliation algorithms, API endpoints, and edge cases.

### Running Tests Locally

```bash
cd backend
npm test
```

### Coverage Scope:
- ✅ **Deterministic Matching**: Validates primary `lifecycle_id` match and composite fallback resolution.
- ✅ **Integer Arithmetic**: Verifies zero decimal precision errors on multi-tranche debits and refund credits.
- ✅ **State Transitions**: Validates `PENDING` $\rightarrow$ `PARTIAL` $\rightarrow$ `FULLY_SETTLED` $\rightarrow$ `REFUNDED` $\rightarrow$ `OVER_SETTLED`.
- ✅ **Idempotency**: Proves identical CSV uploads skip duplicates with zero total balance increase.
- ✅ **Conflicting Duplicate Isolation**: Ensures mismatched duplicates are blocked and logged.
- ✅ **Aging SLA Calculation**: Confirms transactions $>7$ days without settlement transition to critical overdue status.
- ✅ **Zero-Mutation Preview**: Proves `/reconcile/preview` does not mutate database tables.
- ✅ **Exception Persistence**: Tests notes updates and review status transitions in SQLite.

---

## 🚀 Local Development & Quick Start

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+

### 1. Clone & Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start backend server
npm start
# Server runs on http://localhost:4000
```

### 2. Setup Frontend

In a separate terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Dashboard opens on http://localhost:3000
```

### 3. Log In to Dashboard

1. Navigate to `http://localhost:3000` (redirects to `/login`).
2. Input credentials:
   - Email: `admin@openfabric.co`
   - Password: `admin123`
3. Click **Sign In** to access the live reconciliation console.

---

## 🌐 Deployment & Environment Configuration

### Backend Environment Variables (`backend/.env`)

```ini
PORT=4000
DB_PATH=data/reconciliation.db
EVALUATION_DATE=2025-08-15
CORS_ORIGIN=*
JWT_SECRET=openfabric_reconciliation_super_secure_jwt_secret_2026
JWT_EXPIRY=24h
```

### Frontend Environment Variables (`frontend/.env`)

```ini
# Production Render backend URL (or http://localhost:4000 for local dev)
VITE_API_URL=https://of-backend.onrender.com
```

### Vercel Deployment Configuration (`frontend/vercel.json`)

To enable client-side routing on Vercel without 404 errors on browser refresh:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

<div align="center">
  <p><strong>OpenFabric Financial Systems &copy; 2026. High-Precision Transaction Reconciliation Platform.</strong></p>
  <p>Live Dashboard: <a href="https://of-frontend.vercel.app/">https://of-frontend.vercel.app/</a></p>
</div>
