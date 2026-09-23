-- Core identity/customer/business/consent/data foundation.
-- Representative production DDL; service migrations should split this into migration-safe files.

CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS customer;
CREATE SCHEMA IF NOT EXISTS business;
CREATE SCHEMA IF NOT EXISTS consent;
CREATE SCHEMA IF NOT EXISTS data_hub;
CREATE SCHEMA IF NOT EXISTS documents;
CREATE SCHEMA IF NOT EXISTS data_quality;

CREATE TABLE customer.customer (
  customer_id uuid PRIMARY KEY,
  customer_type text NOT NULL CHECK (customer_type IN ('INDIVIDUAL','BUSINESS_OWNER','MERCHANT')),
  status platform.record_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  version bigint NOT NULL DEFAULT 1
);

CREATE TABLE identity.identity (
  identity_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL UNIQUE REFERENCES customer.customer(customer_id),
  legal_name text NOT NULL,
  date_of_birth date,
  phone_e164 text,
  email text,
  national_id_token text,
  verification_status identity.verification_status NOT NULL DEFAULT 'PENDING',
  verification_provider text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX identity_phone_uq ON identity.identity(phone_e164) WHERE phone_e164 IS NOT NULL;

CREATE TABLE consent.consent (
  consent_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  purpose text NOT NULL CHECK (purpose IN ('CREDIT','AFFORDABILITY','FRAUD_SECURITY','SERVICING','COMPLIANCE','PERSONALIZATION','MARKETING')),
  scope jsonb NOT NULL,
  status consent.consent_status NOT NULL,
  granted_at timestamptz NOT NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  source text NOT NULL,
  version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at IS NULL OR expires_at > granted_at)
);

CREATE INDEX consent_customer_status_idx ON consent.consent(customer_id,status);

CREATE TABLE business.business (
  business_id uuid PRIMARY KEY,
  legal_name text,
  trading_name text,
  registration_number text,
  status platform.record_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE business.customer_business (
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  business_id uuid NOT NULL REFERENCES business.business(business_id),
  relationship_type text NOT NULL,
  ownership_percent numeric(5,2),
  started_at date,
  ended_at date,
  PRIMARY KEY (customer_id,business_id),
  CHECK (ownership_percent IS NULL OR (ownership_percent >= 0 AND ownership_percent <= 100))
);

CREATE TABLE data_hub.source_account (
  source_account_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  provider text NOT NULL,
  external_account_token text NOT NULL,
  account_type text,
  institution_name text,
  currency char(3),
  consent_id uuid REFERENCES consent.consent(consent_id),
  verified_at timestamptz,
  last_synced_at timestamptz,
  status platform.record_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX source_account_provider_token_uq
ON data_hub.source_account(provider,external_account_token);

CREATE TABLE data_hub.transaction (
  transaction_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  source_account_id uuid REFERENCES data_hub.source_account(source_account_id),
  source text NOT NULL,
  external_transaction_id text,
  occurred_at timestamptz NOT NULL,
  amount_minor bigint NOT NULL CHECK (amount_minor >= 0),
  currency char(3) NOT NULL,
  direction text NOT NULL CHECK (direction IN ('CREDIT','DEBIT')),
  category text,
  counterparty text,
  confidence numeric(5,4) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
  verification_status text,
  consent_id uuid REFERENCES consent.consent(consent_id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX transaction_external_uq
ON data_hub.transaction(source,external_transaction_id)
WHERE external_transaction_id IS NOT NULL;

CREATE INDEX transaction_customer_time_idx
ON data_hub.transaction(customer_id,occurred_at DESC);

CREATE TABLE documents.document (
  document_id uuid PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES customer.customer(customer_id),
  document_type text NOT NULL,
  object_uri text NOT NULL,
  sha256 text NOT NULL,
  malware_status text NOT NULL DEFAULT 'PENDING',
  extraction_status text NOT NULL DEFAULT 'PENDING',
  confidence numeric(5,4),
  source text NOT NULL,
  consent_id uuid REFERENCES consent.consent(consent_id),
  retention_class text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX document_hash_customer_uq ON documents.document(customer_id,sha256);
