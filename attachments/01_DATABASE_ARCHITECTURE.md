# 01 — Database Architecture

## PostgreSQL topology

Recommended logical separation:

1. `trust_core` — transactional domain database(s).
2. `trust_reporting` — read replicas/reporting projections.
3. `trust_warehouse` — analytical warehouse/lakehouse.
4. Object storage — documents, evidence packages, exports, model artifacts.

A single PostgreSQL cluster may host the schemas initially, but service ownership must remain logical and enforceable.

## Schemas

identity
customer
business
consent
data_hub
documents
data_quality
application
affordability
credit
fraud
aml
exposure
policy
pricing
products
offers
contracts
lending
payments
ledger
collections
support
notifications
models
model_governance
security
audit
reporting
reconciliation
credit_reporting
relationship
treasury
accounting
tax
partners
vendors
workforce
platform

## Ownership rule

Each schema has one owning service. Other services access it through APIs/events or approved read models. Direct cross-service writes are forbidden.

## PostgreSQL conventions

- `timestamptz` for timestamps.
- `numeric(p,s)` only for non-money measurements where decimal precision is required; financial amounts use `bigint` minor units.
- `boolean` for flags.
- `jsonb` only for bounded extensibility, raw provider payloads, model explanations, or versioned configuration; do not hide relational business state inside JSON.
- `text` for identifiers whose format is external/provider-defined.
- `citext` where case-insensitive uniqueness is genuinely required.
- `inet` for IP addresses.
- `bytea` only where encrypted/tokenized binary material is intentionally stored.
- `CHECK` constraints for local invariants.
- Foreign keys for authoritative relationships.
- Unique constraints for natural/idempotency keys.
- Partial indexes for active/operational queues.
- Partition high-volume append-only tables by time only when operational volume justifies it.

## Audit columns

Normal mutable domain tables:
- `created_at`
- `created_by`
- `updated_at`
- `updated_by`
- `version`
- optional `deleted_at`, only where semantically valid.

Immutable/event/audit/ledger tables:
- `created_at`
- `created_by`
- no update/delete path.

## Data classification

Every PII/sensitive table should have documented classification:
- PUBLIC
- INTERNAL
- CONFIDENTIAL
- RESTRICTED
- HIGHLY_RESTRICTED

Sensitive fields should be tokenized/encrypted where justified, with keys managed outside PostgreSQL.

## RLS

Use row-level security for high-risk operational tables where it materially reduces blast radius, especially customer support, documents, sensitive identity data and selected operational views. RLS is a secondary control, not a substitute for service authorization.

## Financial immutability

The following are append-only:
- ledger entries
- journal entries
- payment events
- disbursement instructions/results
- reconciliation evidence
- audit records
- credit reporting submissions/snapshots
- immutable decision snapshots
- model/policy approval history

Corrections use new records referencing the original.
