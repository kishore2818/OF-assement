-- Transaction Reconciliation System - Database Schema

DROP TABLE IF EXISTS exception_reviews;
DROP TABLE IF EXISTS reconciliation_run_items;
DROP TABLE IF EXISTS reconciliation_runs;
DROP TABLE IF EXISTS settlement_history;
DROP TABLE IF EXISTS transactions;

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

CREATE TABLE settlement_history (
    settlement_id VARCHAR(50) PRIMARY KEY,
    transaction_id VARCHAR(50),
    lifecycle_id VARCHAR(50),
    settlement_date DATE NOT NULL,
    settlement_amount DECIMAL(10,2) NOT NULL,
    settlement_type VARCHAR(10) NOT NULL, -- 'DEBIT' or 'CREDIT'
    currency VARCHAR(3) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
);

-- Indexes for fast matching and query performance
CREATE INDEX IF NOT EXISTS idx_transactions_lifecycle ON transactions(lifecycle_id);
CREATE INDEX IF NOT EXISTS idx_transactions_fallback ON transactions(account_id, merchant_name, transaction_date);
CREATE INDEX IF NOT EXISTS idx_settlement_history_txn ON settlement_history(transaction_id);

-- Reconciliation Runs (Audit & History)
CREATE TABLE IF NOT EXISTS reconciliation_runs (
    run_id VARCHAR(50) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL, -- 'COMPLETED', 'PARTIAL', 'FAILED'
    records_read INTEGER DEFAULT 0,
    matched_records INTEGER DEFAULT 0,
    new_settlements_inserted INTEGER DEFAULT 0,
    duplicates_skipped INTEGER DEFAULT 0,
    invalid_records INTEGER DEFAULT 0,
    unmatched_records INTEGER DEFAULT 0,
    ambiguous_records INTEGER DEFAULT 0,
    transactions_updated INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reconciliation_run_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id VARCHAR(50) NOT NULL,
    row_number INTEGER,
    settlement_id VARCHAR(50),
    item_type VARCHAR(20) NOT NULL, -- 'INVALID', 'UNMATCHED', 'AMBIGUOUS', 'CONFLICT', 'SKIPPED_DUPLICATE', 'MATCHED'
    reason TEXT,
    raw_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES reconciliation_runs(run_id)
);

CREATE INDEX IF NOT EXISTS idx_run_items_run ON reconciliation_run_items(run_id);

-- Exception Management & Operational Review Workflow
CREATE TABLE IF NOT EXISTS exception_reviews (
    exception_id VARCHAR(100) PRIMARY KEY,
    transaction_id VARCHAR(50),
    issue_code VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    review_status VARCHAR(20) DEFAULT 'UNREVIEWED', -- 'UNREVIEWED', 'UNDER_REVIEW', 'RESOLVED'
    notes TEXT,
    reviewed_by VARCHAR(50) DEFAULT 'Demo Analyst',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exception_reviews_txn ON exception_reviews(transaction_id);

