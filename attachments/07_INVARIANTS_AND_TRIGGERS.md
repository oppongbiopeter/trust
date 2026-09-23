# 07 — Database Invariants

## Double-entry invariant

For every posted ledger transaction:

`SUM(debits) = SUM(credits)` within the transaction's currency.

Enforce at the service transaction boundary and with periodic database integrity jobs. A deferred constraint trigger can be used where practical.

## Corporate journal invariant

For every posted journal:
`SUM(debit_minor) = SUM(credit_minor)`.

## Payment invariants

- Amount > 0.
- Provider reference unique where supplied.
- A successful payment cannot be transformed in place into another financial outcome.
- Reversal references the original.
- Allocations cannot exceed the payment amount.
- Unknown provider state is preserved until reconciliation.

## Loan invariants

- Loan cannot be ACTIVE without accepted contract.
- Loan cannot be disbursed without an authorized disbursement instruction and funding reservation.
- Principal cannot be negative.
- A settled loan cannot receive ordinary new disbursement.
- Restructure does not overwrite original schedule/history.

## Offer invariants

- Offer amount is within product bounds.
- Pricing/policy/model versions are captured at decision time.
- Expired offers cannot be accepted.
- Accepted offer cannot be silently edited.

## Consent invariants

- Restricted data access must reference an appropriate consent/purpose or documented legal basis.
- Revoked consent must stop future processing for purposes requiring consent.
- Historical processing evidence remains auditable.

## Audit invariants

- No application DELETE/UPDATE endpoint for audit events.
- Audit records include actor, action, resource, reason where applicable, correlation ID and relevant decision versions.

## Idempotency

Financial commands must have a durable idempotency record keyed by actor scope + idempotency key. Reusing a key with a different request hash is a hard conflict.

## Optimistic concurrency

Mutable high-risk entities use `version bigint`. UPDATE must include expected version and increment it atomically.

## Soft deletion

Allowed for:
- selected customer preferences
- operational configuration
- non-authoritative drafts where legal retention allows.

Not allowed for:
- ledger entries
- payment events
- disbursement results
- audit events
- credit reporting snapshots
- immutable decision records.
