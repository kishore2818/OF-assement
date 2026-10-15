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

## Table of Contents

1. [Executive Summary & Problem Statement](#executive-summary--problem-statement)
2. [Architectural Overview & System Flow](#architectural-overview--system-flow)
3. [Authentication & Security Architecture (JWT + CORS)](#authentication--security-architecture-jwt--cors)
4. [Sample Datasets & Business Scenarios](#sample-datasets--business-scenarios)
5. [Core Platform Features & Enhancements](#core-platform-features--enhancements)
6. [Assumptions Made](#assumptions-made)
7. [Known Limitations & Future Roadmap](#known-limitations--future-roadmap)
8. [REST API Documentation](#rest-api-documentation)
9. [Database Schema & Entity Relationship](#database-schema--entity-relationship)
10. [Automated Testing Suite](#automated-testing-suite)
11. [Local Development & Quick Start](#local-development--quick-start)
12. [Deployment & Environment Configuration](#deployment--environment-configuration)

---

## Executive Summary & Problem Statement

In modern fintech, internal transaction authorization records must be reconciled against subsequent processor and acquirer settlement files. This platform solves the core challenges of settlement reconciliation:

1. **Two-Tier Deterministic Matching**: Resolves settlements via primary `lifecycle_id` and gracefully falls back to a composite key (`account_id` + `merchant_name` + `transaction_date`) when lifecycle IDs are omitted by acquirers.
2. **Zero Floating-Point Drift**: Employs integer-cents arithmetic throughout all ledger balance computations to eliminate standard IEEE-754 floating-point inaccuracies.
3. **Multi-Tranche Progression & Partial Refunds**: Correctly aggregates partial debit installments, credit refund adjustments, and over-settlement discrepancies.
4. **Idempotent Ingestion & Quarantine**: Prevents duplicate settlement entries while detecting and isolating conflicting record alterations.
5. **Auditable Exception Management Desk**: Delivers operational triage with persistent notes, review lifecycle statuses (`UNREVIEWED`, `UNDER_REVIEW`, `RESOLVED`), and audit tracking.

---

## Architectural Overview & System Flow

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

## Authentication & Security Architecture (JWT + CORS)

- **JWT Session Security (RFC-7519)**: The API issues signed Bearer tokens upon login (`POST /auth/login`) verified by middleware (`GET /auth/me`). Passwords are encrypted with `bcryptjs` (10 salt rounds).
- **CORS Protection**: Configured in Express to allow secure communication between the Vercel frontend (`https://of-frontend.vercel.app`) and the Render backend API (`https://of-backend.onrender.com`), supporting preflight `OPTIONS` requests, credentials, and authorized headers.

---

## Sample Datasets & Business Scenarios

All scenario datasets are available as standalone CSV files in the repository root for testing via the dashboard or API:

| Scenario | Target Txn | Amount | Dataset File | Settlement Details | Matching Method | Resulting Status | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Scenario 1** | `TXN001` | $125.99 | `scenario_1.csv` | 1 DEBIT ($125.99) | Tier 1 (`LC001`) | `FULLY_SETTLED` | `CLEAR` 🟢 |
| **Scenario 2** | `TXN003` | $45.30 | `scenario_2.csv` | 1 DEBIT ($35.30) | Tier 1 (`LC003`) | `PARTIAL` | `WARNING` 🟡 |
| **Scenario 3** | `TXN004` | $899.99 | `scenario_3.csv` | 1 DEBIT + 1 CREDIT | Tier 1 (`LC004`) | `REFUNDED` | `CLEAR` 🟢 |
| **Scenario 4** | `TXN007` | $156.78 | `scenario_4.csv` | 1 DEBIT ($180.78) | Tier 1 (`LC007`) | `OVER_SETTLED` | `CRITICAL` 🔴 |
| **Scenario 5** | `TXN013` | $32.45 | `scenario_5.csv` | 1 DEBIT (No LC) | Tier 2 Composite Fallback | `FULLY_SETTLED` | `CLEAR` 🟢 |
| **Scenario 6** | `TXN005` | $234.50 | `scenario_6.csv` | 2 DEBIT tranches | Tier 1 (`LC005`) | `PARTIAL` $\rightarrow$ `FULLY_SETTLED` | `CLEAR` 🟢 |
| **Scenario 7** | `TXN006` | $87.25 | `scenario_7.csv` | 1 DEBIT + 1 CREDIT | Tier 1 (`LC006`) | `PARTIAL` ($75.00 net) | `WARNING` 🟡 |
| **Master Batch**| Multiple | Multi | `all_scenarios_1_to_7.csv` | 10 records | Multi-Tier Engine | Batch Reconciled | Mixed |
| **Full Batch** | Multiple | 19 Rows | `exercise_dataset_19_rows.csv` | 19 records | Multi-Tier Engine | Complete Exercise Batch | Mixed |

### Scenario Logic & Edge-Case Protection:
- **Scenario 1 (Exact Match)**: Exact 1-to-1 match via lifecycle ID; settles balance to $0.00 (`FULLY_SETTLED`).
- **Scenario 2 (Under-Settlement)**: Processor remits $35.30 of $45.30; flags $10.00 shortfall as `WARNING`.
- **Scenario 3 (Refund Credit)**: Net settlement: $\$899.99 \text{ (DEBIT)} - \$20.00 \text{ (CREDIT)} = \$879.99$; marked `REFUNDED` (`CLEAR`).
- **Scenario 4 (Over-Settlement)**: Processor remits $180.78 on $156.78 authorization; flags +$24.00 excess as `CRITICAL`.
- **Scenario 5 (Composite Fallback)**: Missing `lifecycle_id` resolves via `account_id` + `merchant_name` + `transaction_date`.
- **Scenario 6 (Multi-Tranche)**: Progressive installments ($150.00 + $84.50 = $234.50) transition from `PARTIAL` to `FULLY_SETTLED`.
- **Scenario 7 (Partial Return)**: Net settlement: $\$87.25 \text{ (DEBIT)} - \$12.25 \text{ (CREDIT)} = \$75.00 < \$87.25$; flags under-settlement as `WARNING`.
- **Edge Cases (Scenarios 8–12)**: Idempotency skips re-uploaded duplicates with zero double-counting; conflicting amounts are quarantined; ambiguous candidates are flagged rather than guessed; currency mismatches (`EUR` vs `USD`) are quarantined; failed/declined transactions are barred from settlement.

---

## Core Platform Features & Enhancements

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

### 8. Auditor Reports Desk & Dual-Format Export Engine (`/reports`)
The platform includes an automated reporting center enabling financial auditors and stakeholders to generate compliance-grade reports in both **PDF** and **CSV** formats:
- **Executive Audit Report (PDF)**:
  - Client-side generator using `jspdf` and `jspdf-autotable`.
  - Features the official OpenFabric brand crest, executive KPI metric cards, status distribution breakdown, running variance calculations, itemized ledger audit tables with color-differentiated status cells (`didParseCell`), and formal algorithmic certification sign-off with running page footers (`Page X of Y`).
- **Color-Coded Multi-Dataset CSV Exports**:
  - **Filtered Transactions CSV (`GET /transactions/export`)**: Formatted with UTF-8 status emoji indicators (`🟢 FULLY_SETTLED`, `🟡 PARTIAL`, `🔴 OVER_SETTLED`, `🟣 REFUNDED`, `⚪ PENDING`) and severity flags (`🔴 CRITICAL`, `🟡 WARNING`, `🟢 CLEAR`) for immediate visual clarity in Excel and Google Sheets.
  - **Ingested Settlements CSV**: Formatted with `🟢 DEBIT` / `🟣 CREDIT` badges and transaction linkage markers.
  - **Transaction Dossier CSV**: Granular timeline exports highlighting matching methods (`🔹 PRIMARY_LIFECYCLE` vs `🔸 FALLBACK_COMPOSITE`).
  - **Quarantined Records CSV**: Instant download of invalid, conflicting duplicate, or currency-mismatched records directly from reconciliation runs.

### 9. Advanced Multi-Dimensional Filtering & Search Control
The dashboard provides a real-time financial control room equipped with multi-dimensional filtering and search:
- **Instant Omni-Search**: Debounced search matching Transaction ID, Lifecycle ID, Merchant Name, or Account ID.
- **Settlement Status Pills**: Single-click segmented filters for `All`, `Fully Settled` (🟢), `Partially Settled` (🟡), `Pending` (⚪), `Over-Settled` (🔴), and `Refunded` (🟣).
- **Issue Severity Triage**: Priority dropdown for `All`, `Critical Discrepancies` (🔴), `Warnings` (🟡), and `Clean Records` (🟢).
- **Historical Time-Travel**: Interactive calendar date selector dynamically re-evaluating ledger balances and SLA aging as of any historical date.
- **SLA Aging Bands**: Real-time classification into 0–3 Days (Active), 4–7 Days (Maturing), and >7 Days (Overdue SLA Breach).

---

## Assumptions Made

Designed for client e-commerce operations processing high-volume retail checkouts:

- **Split Shipments**: Single orders with split shipments generate multiple `DEBIT` tranches against one authorization; the engine accumulates tranches until fully settled.
- **Refunds & Returns**: Customer returns generate `CREDIT` tranches. Net balance is $\sum \text{DEBIT} - \sum \text{CREDIT}$. Legitimate refunds are classified as `REFUNDED` (`CLEAR`).
- **Two-Tier Matching**: Primary matching uses payment gateway `lifecycle_id` (Stripe/Adyen); fallback matching uses `account_id` + `merchant_name` + `transaction_date` for legacy processors.
- **7-Day Settlement SLA**: Retail payouts typically clear in T+2 to T+5 days. Transactions unsettled after 7 days trigger an `AGING_DELAY` warning.
- **Cent-Level Precision**: All calculations use integer cents ($1.00 = 100¢$) to prevent floating-point rounding errors across checkout carts.
- **Idempotent Ingestion**: Duplicate batch payouts or resent webhooks skip existing records with zero double-counting.
- **Exclusion of Failed Carts**: Transactions in `FAILED` or `DECLINED` states cannot receive settlement funds.

---

## Known Limitations & Future Roadmap

Planned enhancements for direct integration into client e-commerce platforms:

- **Storefront Connectors**: Add real-time order & payment webhook listeners for Shopify, WooCommerce, and custom headless storefronts.
- **Automated Gateway Polling**: Daily automated SFTP/API ingestion from Stripe Payouts, Adyen, and merchant acquiring banks.
- **Multi-Currency FX Rates**: Real-time European Central Bank / Open Exchange Rates conversion for cross-border international sales.
- **ERP Accounting Sync**: Automated bi-directional posting of reconciled payout batches into NetSuite, QuickBooks, or Xero.
- **Chargeback Defense Module**: Automated dispute tracker monitoring bank evidence submission deadlines.

---

## REST API Documentation

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

## Database Schema & Entity Relationship

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

## Automated Testing Suite

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

## Local Development & Quick Start

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

## Deployment & Environment Configuration

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
