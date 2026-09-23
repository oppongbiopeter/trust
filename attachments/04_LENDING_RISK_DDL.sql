-- Application, affordability, credit, fraud, AML, exposure, policy and pricing.

CREATE SCHEMA IF NOT EXISTS application;
CREATE SCHEMA IF NOT EXISTS affordability;
CREATE SCHEMA IF NOT EXISTS credit;
CREATE SCHEMA IF NOT EXISTS fraud;
CREATE SCHEMA IF NOT EXISTS aml;
CREATE SCHEMA IF NOT EXISTS exposure;
CREATE SCHEMA IF NOT EXISTS policy;
CREATE SCHEMA IF NOT EXISTS pricing;
CREATE SCHEMA IF NOT EXISTS products;
CREATE SCHEMA IF NOT EXISTS offers;
CREATE SCHEMA IF NOT EXISTS contracts;
CREATE SCHEMA IF NOT EXISTS models;

CREATE TABLE products.product (
  product_id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  currency char(3) NOT NULL,
  min_amount_minor bigint NOT NULL CHECK (min_amount_minor >= 0),
  max_amount_minor bigint NOT NULL CHECK (max_amount_minor >= min_amount_minor),
  min_term_days integer NOT NULL CHECK (min_term_days > 0),
  max_term_days integer NOT NULL CHECK (max_term_days >= min_term_days),
  status platform.record_status NOT NULL DEFAULT 'ACTIVE',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE application.application (
  application_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  product_id uuid NOT NULL REFERENCES products.product(product_id),
  requested_amount_minor bigint NOT NULL CHECK (requested_amount_minor > 0),
  requested_term_days integer NOT NULL CHECK (requested_term_days > 0),
  purpose text,
  status application.application_status NOT NULL DEFAULT 'DRAFT',
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version bigint NOT NULL DEFAULT 1
);

CREATE INDEX application_queue_idx
ON application.application(status,created_at)
WHERE status IN ('SUBMITTED','PROCESSING','MANUAL_REVIEW','INFORMATION_REQUIRED');

CREATE TABLE affordability.assessment (
  affordability_assessment_id uuid PRIMARY KEY,
  application_id uuid NOT NULL UNIQUE REFERENCES application.application(application_id),
  verified_income_minor bigint,
  estimated_income_minor bigint,
  household_obligations_minor bigint,
  business_costs_minor bigint,
  existing_debt_service_minor bigint,
  sustainable_repayment_minor bigint,
  assessment_method text NOT NULL,
  confidence numeric(5,4),
  data_as_of timestamptz,
  policy_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE credit.assessment (
  credit_assessment_id uuid PRIMARY KEY,
  application_id uuid NOT NULL UNIQUE REFERENCES application.application(application_id),
  internal_risk_score numeric(12,6),
  trust_score numeric(12,6),
  bureau_reference text,
  bureau_score numeric(12,6),
  thin_file boolean NOT NULL DEFAULT false,
  assessment_version text NOT NULL,
  model_version text,
  policy_version text NOT NULL,
  recommendation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fraud.assessment (
  fraud_assessment_id uuid PRIMARY KEY,
  application_id uuid NOT NULL UNIQUE REFERENCES application.application(application_id),
  fraud_score numeric(12,6),
  action fraud.action_type NOT NULL,
  reason_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  model_version text,
  policy_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE aml.alert (
  aml_alert_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  severity text NOT NULL,
  typology text,
  status text NOT NULL,
  triggered_at timestamptz NOT NULL,
  resolved_at timestamptz
);

CREATE TABLE exposure.exposure (
  exposure_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  currency char(3) NOT NULL,
  principal_outstanding_minor bigint NOT NULL DEFAULT 0,
  approved_not_disbursed_minor bigint NOT NULL DEFAULT 0,
  contingent_minor bigint NOT NULL DEFAULT 0,
  as_of timestamptz NOT NULL,
  UNIQUE(customer_id,currency,as_of)
);

CREATE TABLE policy.policy_version (
  policy_version_id uuid PRIMARY KEY,
  policy_code text NOT NULL,
  version text NOT NULL,
  status text NOT NULL,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  rules jsonb NOT NULL,
  approved_by uuid,
  approved_at timestamptz,
  UNIQUE(policy_code,version)
);

CREATE TABLE pricing.pricing_version (
  pricing_version_id uuid PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products.product(product_id),
  version text NOT NULL,
  pricing_method text NOT NULL,
  parameters jsonb NOT NULL,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  UNIQUE(product_id,version)
);

CREATE TABLE offers.offer (
  offer_id uuid PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES application.application(application_id),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL,
  term_days integer NOT NULL CHECK (term_days > 0),
  interest_minor bigint NOT NULL DEFAULT 0 CHECK (interest_minor >= 0),
  fees_minor bigint NOT NULL DEFAULT 0 CHECK (fees_minor >= 0),
  total_repayable_minor bigint NOT NULL CHECK (total_repayable_minor >= 0),
  policy_version text NOT NULL,
  pricing_version text NOT NULL,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contracts.contract (
  contract_id uuid PRIMARY KEY,
  offer_id uuid NOT NULL UNIQUE REFERENCES offers.offer(offer_id),
  document_uri text NOT NULL,
  document_sha256 text NOT NULL,
  version text NOT NULL,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE models.model_version (
  model_version_id uuid PRIMARY KEY,
  model_code text NOT NULL,
  version text NOT NULL,
  lifecycle models.lifecycle_status NOT NULL,
  artifact_uri text,
  training_data_version text,
  validation_report_uri text,
  approval_record_uri text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(model_code,version)
);
