# Architecture Overview: Transaction Reconciliation System

## 1. System High-Level Architecture

The Transaction Reconciliation System is designed as a modular, resilient financial operations platform capable of ingesting high-volume settlement reports, reconciling multi-tranche debits and credits against internal transaction records, and diagnosing exceptions in real time.

```
┌──────────────────────────────────────────────────────────────┐
│                    FinOps React Dashboard                    │
│            (Vite + Tailwind CSS + Recharts + Router)         │
└──────────────────────────────┬───────────────────────────────┘
                               │ REST APIs (JSON / Multipart)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  Express.js Backend (Node.js)                │
│                                                              │
│  ┌──────────────────────┐        ┌─────────────────────────┐ │
│  │ Reconciliation Svc   │ ◄────► │ Matching Service        │ │
│  │ (CSV Parsing/Zod)    │        │ (Primary & Fallback)    │ │
│  └──────────┬───────────┘        └─────────────────────────┘ │
│             │                                                │
│  ┌──────────▼───────────┐        ┌─────────────────────────┐ │
│  │ Settlement Svc       │ ◄────► │ Issue Detection Svc     │ │
│  │ (Ledger Aggregation) │        │ (Critical / Warnings)   │ │
│  └──────────┬───────────┘        └─────────────────────────┘ │
└─────────────┼────────────────────────────────────────────────┘
              │ Atomic Transactions (PRAGMA foreign_keys = ON)
              ▼
┌──────────────────────────────────────────────────────────────┐
│                    SQLite Database                           │
│                 (better-sqlite3 Engine)                      │
│                                                              │
│  ┌─────────────────────────┐      ┌────────────────────────┐ │
│  │   transactions Table    │ ◄─── │ settlement_history     │ │
│  │  (Status & Net Totals)  │ 1..N │ (Audit Ledger Events)  │ │
│  └─────────────────────────┘      └────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Components

### A. CSV Parsing & Validation Pipeline (`ReconciliationService`)
- Uses streaming/buffered `csv-parse` for RFC-4180 compliance.
- Strict schema validation enforced using **Zod** (`CSVRecordSchema`):
  - Validates positive numerical values for `settlement_amount`.
  - Enforces date formatting (`YYYY-MM-DD`).
  - Constrains `settlement_type` to `DEBIT` or `CREDIT`.
  - Ensures ISO currency code uniformity.
- Graceful error boundary: Malformed rows are isolated into the batch exception report without aborting valid rows.

### B. Two-Tier Deterministic Matching Engine (`MatchingService`)
1. **Tier 1 (Primary Matching)**:
   - Evaluates `lifecycle_id`.
   - Exact single-candidate resolution $\rightarrow$ `MATCHED`.
   - Multiple candidate collision $\rightarrow$ `AMBIGUOUS`.
   - Missing key in database $\rightarrow$ `UNMATCHED`.
2. **Tier 2 (Fallback Matching)**:
   - Invoked when `lifecycle_id` is null or empty.
   - Evaluates composite key: `account_id` + `merchant_name` + `transaction_date`.
   - Disallows attachment if candidate transactions have status `FAILED` or `DECLINED` (per business compliance rules).

### C. Financial Arithmetic & Status Transitions (`SettlementService`)
- Operates using **integer cents arithmetic** (`toCents`, `fromCents`) to eliminate IEEE-754 floating point precision inaccuracies.
- Formulates Net Settled Balance:
  $$\text{Net Settled} = \sum(\text{DEBIT}) - \sum(\text{CREDIT})$$
- Evaluates state machine transitions:
  - `PENDING`: No settlement entries.
  - `PARTIAL`: $0 < \text{Net Settled} < \text{Txn Amount}$ (without refund credit).
  - `FULLY_SETTLED`: $\text{Net Settled} = \text{Txn Amount}$.
  - `OVER_SETTLED`: $\text{Net Settled} > \text{Txn Amount}$.
  - `REFUNDED`: $\text{Net Settled} < \text{Txn Amount}$ with at least one credit/refund event.
  - `NOT_APPLICABLE`: Original transaction failed or declined.

### D. Automated Issue Detection Engine (`IssueDetectionService`)
- **🔴 Critical Issue**:
  1. Over-settlement: Net settled > original transaction amount.
  2. Overdue settlement: Eligible transaction with no settlement recorded $> 7$ days from `transaction_date`.
- **🟡 Warning Issue**:
  1. Under-settlement: Net settled < original transaction amount (awaiting subsequent tranches).
- **🟢 Clear / Clean**:
  1. Fully settled transactions and legitimate refunds conforming to order value.

---

## 3. Database Integrity & Idempotency
- All reconciliation runs execute within an atomic SQLite transaction (`db.transaction`).
- Duplicate prevention: Incoming `settlement_id` values are checked against `settlement_history`.
  - Identical records are safely skipped (idempotent re-runs).
  - Conflicting data on identical IDs are flagged in the reconciliation error log.
- Relational integrity: Foreign keys are enforced at runtime via `PRAGMA foreign_keys = ON;`.
