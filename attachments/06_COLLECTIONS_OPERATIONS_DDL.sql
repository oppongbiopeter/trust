-- Collections, support, notifications, workforce/security/audit and platform reliability.

CREATE SCHEMA IF NOT EXISTS collections;
CREATE SCHEMA IF NOT EXISTS support;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS workforce;
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS partners;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS credit_reporting;

CREATE TABLE collections.case_record (
  collection_case_id uuid PRIMARY KEY,
  loan_id uuid NOT NULL REFERENCES lending.loan(loan_id),
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  status collections.case_status NOT NULL,
  days_past_due integer NOT NULL DEFAULT 0 CHECK (days_past_due >= 0),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE collections.promise_to_pay (
  promise_id uuid PRIMARY KEY,
  collection_case_id uuid NOT NULL REFERENCES collections.case_record(collection_case_id),
  promised_at timestamptz NOT NULL,
  promised_amount_minor bigint NOT NULL CHECK (promised_amount_minor > 0),
  currency char(3) NOT NULL,
  status collections.promise_status NOT NULL,
  fulfilled_at timestamptz
);

CREATE TABLE support.case_record (
  support_case_id uuid PRIMARY KEY,
  customer_id uuid REFERENCES customer.customer(customer_id),
  category text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL,
  assigned_to uuid,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE notifications.notification (
  notification_id uuid PRIMARY KEY,
  customer_id uuid REFERENCES customer.customer(customer_id),
  domain text NOT NULL,
  channel text NOT NULL,
  template_code text NOT NULL,
  template_version text NOT NULL,
  status text NOT NULL,
  required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz
);

CREATE TABLE workforce.employee (
  employee_id uuid PRIMARY KEY,
  status platform.record_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workforce.role (
  role_id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL
);

CREATE TABLE workforce.employee_role (
  employee_id uuid NOT NULL REFERENCES workforce.employee(employee_id),
  role_id uuid NOT NULL REFERENCES workforce.role(role_id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  granted_by uuid,
  PRIMARY KEY(employee_id,role_id)
);

CREATE TABLE security.session (
  session_id uuid PRIMARY KEY,
  customer_id uuid REFERENCES customer.customer(customer_id),
  employee_id uuid REFERENCES workforce.employee(employee_id),
  device_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE TABLE audit.audit_event (
  audit_event_id uuid PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_type audit.actor_type NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  customer_id uuid,
  old_state jsonb,
  new_state jsonb,
  reason text,
  ip_address inet,
  device_id text,
  session_id uuid,
  policy_version text,
  model_version text,
  workflow_version text,
  correlation_id uuid NOT NULL
);

CREATE INDEX audit_customer_time_idx ON audit.audit_event(customer_id,occurred_at DESC);
CREATE INDEX audit_resource_time_idx ON audit.audit_event(resource_type,resource_id,occurred_at DESC);

CREATE TABLE platform.idempotency_key (
  idempotency_key text PRIMARY KEY,
  actor_scope text NOT NULL,
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE TABLE platform.outbox_event (
  outbox_id uuid PRIMARY KEY,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  event_version integer NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text
);

CREATE INDEX outbox_unpublished_idx
ON platform.outbox_event(occurred_at)
WHERE published_at IS NULL;

CREATE TABLE platform.inbox_event (
  consumer_name text NOT NULL,
  event_id uuid NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL,
  error text,
  PRIMARY KEY(consumer_name,event_id)
);

CREATE TABLE credit_reporting.submission (
  submission_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  loan_id uuid REFERENCES lending.loan(loan_id),
  bureau text NOT NULL,
  snapshot_sha256 text NOT NULL,
  status text NOT NULL,
  submitted_at timestamptz,
  acknowledged_at timestamptz,
  reconciled_at timestamptz
);

CREATE TABLE partners.partner (
  partner_id uuid PRIMARY KEY,
  legal_name text NOT NULL,
  status text NOT NULL,
  kyb_completed_at timestamptz,
  contract_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vendors.vendor (
  vendor_id uuid PRIMARY KEY,
  legal_name text NOT NULL,
  status text NOT NULL,
  risk_rating text,
  contract_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);
