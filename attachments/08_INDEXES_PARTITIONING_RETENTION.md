# 08 — Indexing, Partitioning, Retention

## High-value indexes

Customer:
- phone/email where uniqueness is required
- customer status
- created_at

Applications:
- status + created_at
- customer_id + created_at DESC

Loans:
- customer_id + status
- status + created_at
- maturity/delinquency queues

Payments:
- provider + provider_reference
- loan_id + status + initiated_at
- customer_id + initiated_at

Transactions:
- customer_id + occurred_at
- source + external_transaction_id

Audit:
- customer_id + occurred_at
- resource_type + resource_id + occurred_at
- actor_id + occurred_at where operationally needed

Outbox:
- unpublished partial index

## Partition candidates

Partition only after volume testing:
- data_hub.transaction by month
- audit.audit_event by month
- ledger.entry by month if volume is very high
- platform.outbox_event by month if required
- notification delivery history by month

Do not partition core parent entities merely for theoretical scale.

## Retention

Retention must be driven by the Ghana legal/regulatory obligation register, contracts, product terms and documented data classification. The database should support retention classes rather than embedding arbitrary deletion dates in code.

For data subject requests:
- identify applicable legal basis and retention obligation
- restrict processing where required
- preserve records that must legally remain
- record the decision/evidence
- do not destroy immutable financial/audit records merely because a user requests deletion.

## Archival

Move cold, legally retainable records to controlled archival storage. Preserve:
- original hash
- record identifier
- source
- timestamps
- retention class
- legal hold where applicable
- chain-of-custody metadata.
