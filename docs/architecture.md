# Architecture Overview: Transaction Reconciliation System

## 1. System High-Level Architecture

The Transaction Reconciliation System is designed as a modular, resilient financial operations platform capable of ingesting high-volume settlement reports, reconciling multi-tranche debits and credits against internal transaction records, and diagnosing exceptions in real time.

```
┌──────────────────────────────────────────────────────────────┐
│                OpenFabric Reconcile Dashboard                │
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

---

## 4. OpenFabric Design System & Responsive Architecture

### A. Curated Brand Color System

| Role | Token / Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `brand.600` | `#4F46E5` | OpenFabric Tech Cobalt-Indigo. Primary actions, active navigation, trend curves. |
| **Brand Hover** | `brand.700` | `#4338CA` | Interactive hover & focus state. |
| **Brand Accent** | `cyan.500` | `#06B6D4` | Electric Cyan micro-accents and logo gradient endpoint. |
| **Deep Canvas** | `obsidian.950`| `#0B0F19` | Midnight Obsidian dark shell for persistent sidebar navigation. |
| **Sidebar Borders** | `obsidian.800`| `#1E293B` | Structural boundary lines and status container borders. |
| **App Canvas** | `surface.canvas`| `#F8FAFC` | Alabaster Slate neutral page background (glare-free, readable). |
| **Surface Cards** | `surface.card`| `#FFFFFF` | Crisp pure white KPI cards, charts, and table containers. |
| **Borders** | `border` | `#E2E8F0` | Fine card edges and table horizontal divider borders. |
| **Headings** | `text.slate-900`| `#0F172A` | Maximum contrast typography for numbers, totals, and headings. |
| **Muted Copy** | `text.slate-500`| `#64748B` | Subtitles, date formats, and secondary metadata. |

### B. High-Contrast Financial Semantic States (WCAG AAA)

- **Fully Settled**: `#059669` (Emerald 600) | Pill: `#ECFDF5` | Border: `#A7F3D0`
- **Partial / Warning**: `#D97706` (Amber 600) | Pill: `#FFFBEB` | Border: `#FDE68A`
- **Critical / Over-Settled**: `#E11D48` (Rose 600) | Pill: `#FFF1F2` | Border: `#FECDD3`
- **Refund / Reversal**: `#7C3AED` (Violet 600) | Pill: `#F5F3FF` | Border: `#DDD6FE`
- **Pending / Unreconciled**: `#475569` (Slate 600) | Pill: `#F1F5F9` | Border: `#E2E8F0`

### C. Multi-Device Responsive Standards

- **Mobile Viewports (< 768px)**:
  - Slide-over drawer with backdrop overlay triggered via the header hamburger button.
  - Stacked 1-column KPI cards and charts.
  - Horizontal-scrolling table wrappers (`overflow-x-auto min-w-[700px]`) protecting all ledger columns from compression.
  - Responsive modal overlays (`max-w-2xl max-h-[92vh] flex flex-col`).
- **Tablet Viewports (768px - 1023px)**:
  - Off-canvas drawer navigation.
  - 2-column KPI cards and responsive flex filter bars.
- **Desktop Viewports (≥ 1024px)**:
  - Docked 64-column (`w-64`) persistent dark navigation.
  - 4-column KPI cards and 3-column financial analytics suite.

### D. Brand Favicon
- Matches the OpenFabric sidebar logo: 32×32 SVG with a 135° diagonal gradient from `#4F46E5` to `#06B6D4`, housing the white `Layers` vector glyph.
