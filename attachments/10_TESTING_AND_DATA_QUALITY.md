# 10 — Database Testing and Data Quality

## Automated tests

### Constraint tests
- duplicate provider references rejected
- invalid money rejected
- invalid states rejected
- invalid ownership percentages rejected
- expired offer acceptance blocked
- double-entry imbalance blocked
- duplicate idempotency request handled deterministically

### Integration tests
- application → decision → offer
- offer → contract → loan
- loan → disbursement → payment
- payment → allocation → ledger
- ledger → accounting
- provider unknown → reconciliation
- credit submission → acknowledgement → reconciliation
- consent revocation → access behavior

### Property/invariant tests
Generate transaction sets and verify:
- debits equal credits
- no balance becomes negative where prohibited
- allocations never exceed payment
- reversals net the original
- event consumers are idempotent.

## Data quality dimensions

- completeness
- validity
- uniqueness
- consistency
- timeliness
- accuracy
- lineage
- consent/purpose validity

## Critical data-quality monitors

- unmatched payment rate
- unreconciled disbursement rate
- duplicate external transaction rate
- missing consent linkage
- stale financial-source data
- decision records missing policy/model versions
- orphaned ledger references
- audit-event ingestion failures
- credit-reporting acknowledgement mismatch.

Any critical integrity failure should create an operational case and, where necessary, trigger a kill switch.
