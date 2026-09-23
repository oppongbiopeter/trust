-- Lending, payments, customer ledger, corporate accounting and reconciliation.

CREATE SCHEMA IF NOT EXISTS lending;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS ledger;
CREATE SCHEMA IF NOT EXISTS collections;
CREATE SCHEMA IF NOT EXISTS treasury;
CREATE SCHEMA IF NOT EXISTS accounting;
CREATE SCHEMA IF NOT EXISTS tax;
CREATE SCHEMA IF NOT EXISTS reconciliation;

CREATE TABLE lending.loan (
  loan_id uuid PRIMARY KEY,
  application_id uuid NOT NULL UNIQUE REFERENCES application.application(application_id),
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  contract_id uuid NOT NULL REFERENCES contracts.contract(contract_id),
  product_id uuid NOT NULL REFERENCES products.product(product_id),
  currency char(3) NOT NULL,
  principal_minor bigint NOT NULL CHECK (principal_minor > 0),
  status lending.loan_status NOT NULL,
  disbursed_at timestamptz,
  maturity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version bigint NOT NULL DEFAULT 1
);

CREATE INDEX loan_customer_status_idx ON lending.loan(customer_id,status);
CREATE INDEX loan_active_idx ON lending.loan(status,created_at) WHERE status IN ('ACTIVE','PAST_DUE','DEFAULT','RESTRUCTURED');

CREATE TABLE lending.repayment_schedule (
  schedule_id uuid PRIMARY KEY,
  loan_id uuid NOT NULL REFERENCES lending.loan(loan_id),
  installment_number integer NOT NULL CHECK (installment_number > 0),
  due_at timestamptz NOT NULL,
  principal_due_minor bigint NOT NULL DEFAULT 0 CHECK (principal_due_minor >= 0),
  interest_due_minor bigint NOT NULL DEFAULT 0 CHECK (interest_due_minor >= 0),
  fees_due_minor bigint NOT NULL DEFAULT 0 CHECK (fees_due_minor >= 0),
  total_due_minor bigint NOT NULL CHECK (total_due_minor >= 0),
  UNIQUE(loan_id,installment_number)
);

CREATE TABLE payments.payment (
  payment_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  loan_id uuid REFERENCES lending.loan(loan_id),
  direction payments.payment_direction NOT NULL,
  provider text NOT NULL,
  provider_reference text,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL,
  status payments.payment_status NOT NULL,
  initiated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  unknown_reason text,
  UNIQUE(provider,provider_reference)
);

CREATE INDEX payment_loan_status_idx ON payments.payment(loan_id,status,initiated_at DESC);

CREATE TABLE ledger.account (
  account_id uuid PRIMARY KEY,
  owner_type text NOT NULL,
  owner_id uuid,
  account_code text NOT NULL UNIQUE,
  currency char(3) NOT NULL,
  account_type text NOT NULL,
  status platform.record_status NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE ledger.transaction (
  ledger_transaction_id uuid PRIMARY KEY,
  transaction_type text NOT NULL,
  reference_type text NOT NULL,
  reference_id uuid NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE TABLE ledger.entry (
  ledger_entry_id uuid PRIMARY KEY,
  ledger_transaction_id uuid NOT NULL REFERENCES ledger.transaction(ledger_transaction_id),
  account_id uuid NOT NULL REFERENCES ledger.account(account_id),
  entry_type ledger.entry_type NOT NULL,
  direction text NOT NULL CHECK (direction IN ('DEBIT','CREDIT')),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL,
  original_entry_id uuid REFERENCES ledger.entry(ledger_entry_id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ledger_entry_account_time_idx
ON ledger.entry(account_id,created_at DESC);

CREATE TABLE reconciliation.reconciliation_run (
  reconciliation_run_id uuid PRIMARY KEY,
  reconciliation_type text NOT NULL,
  provider text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status reconciliation.recon_status NOT NULL,
  source_as_of timestamptz
);

CREATE TABLE reconciliation.reconciliation_item (
  reconciliation_item_id uuid PRIMARY KEY,
  reconciliation_run_id uuid NOT NULL REFERENCES reconciliation.reconciliation_run(reconciliation_run_id),
  internal_reference text,
  external_reference text,
  expected_amount_minor bigint,
  observed_amount_minor bigint,
  currency char(3),
  status reconciliation.recon_status NOT NULL,
  exception_code text,
  resolved_at timestamptz
);

CREATE TABLE treasury.funding_pool (
  funding_pool_id uuid PRIMARY KEY,
  name text NOT NULL,
  currency char(3) NOT NULL,
  committed_minor bigint NOT NULL DEFAULT 0 CHECK (committed_minor >= 0),
  available_minor bigint NOT NULL DEFAULT 0 CHECK (available_minor >= 0),
  reserved_minor bigint NOT NULL DEFAULT 0 CHECK (reserved_minor >= 0),
  status platform.record_status NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE treasury.funding_reservation (
  reservation_id uuid PRIMARY KEY,
  funding_pool_id uuid NOT NULL REFERENCES treasury.funding_pool(funding_pool_id),
  loan_id uuid NOT NULL UNIQUE REFERENCES lending.loan(loan_id),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  status text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounting.journal (
  journal_id uuid PRIMARY KEY,
  journal_date date NOT NULL,
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounting.journal_line (
  journal_line_id uuid PRIMARY KEY,
  journal_id uuid NOT NULL REFERENCES accounting.journal(journal_id),
  account_code text NOT NULL,
  debit_minor bigint NOT NULL DEFAULT 0 CHECK (debit_minor >= 0),
  credit_minor bigint NOT NULL DEFAULT 0 CHECK (credit_minor >= 0),
  currency char(3) NOT NULL,
  CHECK ((debit_minor = 0) <> (credit_minor = 0))
);
