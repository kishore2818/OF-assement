# API Specification: Transaction Reconciliation System

The backend provides a RESTful HTTP API over standard JSON and multipart form data. Default port is `4000`.

---

## 1. POST `/reconcile`
Upload and reconcile a settlement CSV report.

- **Content-Type**: `multipart/form-data` (file field: `file`) OR `application/json` (`{ "csv": "<csv text>" }`)

### Response (`200 OK`)
```json
{
  "success": true,
  "summary": {
    "recordsRead": 19,
    "matchedRecords": 16,
    "newSettlementsInserted": 16,
    "duplicatesSkipped": 0,
    "invalidRecords": 0,
    "unmatchedRecords": 3,
    "transactionsUpdated": 11
  },
  "errors": [],
  "unmatched": [
    {
      "settlement_id": "SET016",
      "reason": "No transaction found with lifecycle_id \"LC999\"",
      "record": { ... }
    },
    {
      "settlement_id": "SET017",
      "reason": "Matched transaction TXN015 is in \"FAILED\" state and cannot be settled.",
      "record": { ... }
    }
  ]
}
```

---

## 2. GET `/transactions`
Retrieve all transactions with computed settlement statuses, net totals, and issue flags.

### Query Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `status` | string | Filter by status (`FULLY_SETTLED`, `PARTIAL`, `PENDING`, `OVER_SETTLED`, `REFUNDED`, `ALL`) |
| `severity` | string | Filter by issue severity (`CRITICAL`, `WARNING`, `NONE`, `ALL`) |
| `search` | string | Substring search on `transaction_id`, `merchant_name`, `account_id` |
| `evaluationDate` | string | Reference date for 7-day overdue detection (e.g. `2025-08-15`) |

### Response (`200 OK`)
```json
{
  "success": true,
  "total": 14,
  "evaluationDate": "2025-08-15",
  "data": [
    {
      "transaction_id": "TXN001",
      "lifecycle_id": "LC001",
      "account_id": "ACC123",
      "merchant_name": "Amazon.com",
      "transaction_date": "2025-08-14",
      "transaction_amount": 125.99,
      "currency": "USD",
      "status": "COMPLETED",
      "settlement_status": "FULLY_SETTLED",
      "total_settled_amount": 125.99,
      "outstanding_amount": 0.00,
      "last_settlement_date": "2025-08-15",
      "primary_issue_severity": "NONE",
      "issues": []
    }
  ]
}
```

---

## 3. GET `/transactions/:id`
Retrieve detailed view of a specific transaction including its associated settlement tranches ledger, detected issues with recommendations, and chronological timeline.

### Query Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `evaluationDate` | string | Evaluation reference date (defaults to `2025-08-15`) |

### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "transaction_id": "TXN007",
    "lifecycle_id": "LC007",
    "account_id": "ACC129",
    "merchant_name": "Walmart",
    "transaction_date": "2025-08-14",
    "transaction_amount": 156.78,
    "currency": "USD",
    "status": "COMPLETED",
    "settlement_status": "OVER_SETTLED",
    "total_settled_amount": 180.78,
    "outstanding_amount": 0.00,
    "last_settlement_date": "2025-08-15",
    "primary_issue_severity": "CRITICAL",
    "issues": [
      {
        "code": "OVER_SETTLED_CRITICAL",
        "severity": "CRITICAL",
        "description": "Total settlement amount ($180.78) exceeds transaction amount ($156.78) by $24.00.",
        "recommendation": "Verify acquirer batch files for duplicate credits or initiate clawback / reconciliation adjustment."
      }
    ],
    "settlements": [
      {
        "settlement_id": "SET009",
        "transaction_id": "TXN007",
        "settlement_date": "2025-08-15",
        "settlement_amount": 180.78,
        "settlement_type": "DEBIT",
        "currency": "USD"
      }
    ],
    "timeline": [
      {
        "date": "2025-08-14",
        "type": "TRANSACTION_INITIATED",
        "title": "Transaction Created (COMPLETED)",
        "amount": 156.78
      },
      {
        "date": "2025-08-15",
        "type": "SETTLEMENT_DEBIT",
        "title": "DEBIT Settlement Received [SET009]",
        "amount": 180.78
      },
      {
        "date": "2025-08-15",
        "type": "RECONCILED",
        "title": "Status: OVER_SETTLED"
      }
    ]
  }
}
```

---

## 4. GET `/dashboard/summary`
Retrieve real-time aggregated metrics and status distribution.

### Response (`200 OK`)
```json
{
  "success": true,
  "evaluationDate": "2025-08-15",
  "data": {
    "totalTransactions": 14,
    "eligibleTransactions": 12,
    "totalSettlementRecords": 16,
    "statusBreakdown": {
      "pending": 1,
      "partial": 1,
      "fullySettled": 5,
      "overSettled": 1,
      "refunded": 4,
      "notApplicable": 2
    },
    "issueBreakdown": {
      "criticalCount": 2,
      "warningCount": 1,
      "cleanCount": 11
    },
    "totalOutstandingAmount": 359.73,
    "totalSettledAmount": 2786.11,
    "averageDaysToSettle": 1.0,
    "settlementRate": 41.7
  }
}
```

---

## 5. POST `/reconcile/reset`
Resets the SQLite database back to the clean, un-reconciled initial state.

---

## 6. GET `/transactions/export`
Exports the full transaction and settlement ledger as an RFC-4180 CSV document.
