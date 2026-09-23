# EVENT REGISTRY

All events use the common envelope:

```json
{
  "eventId": "uuid",
  "eventType": "trust.application.submitted",
  "version": 1,
  "time": "RFC3339",
  "producer": "application-service",
  "aggregate": {"type":"application","id":"uuid"},
  "customer": {"id":"uuid"},
  "correlationId": "uuid",
  "causationId": "uuid",
  "actor": {"type":"CUSTOMER|EMPLOYEE|SYSTEM|PARTNER","id":"uuid"},
  "payload": {}
}
```

## Identity
- identity.registered
- identity.verified
- identity.verification_failed
- authentication.succeeded
- authentication.failed
- session.revoked

## Consent
- consent.granted
- consent.revoked
- consent.expired
- consent.suspended

## Data
- financial_source.connected
- financial_source.synced
- financial_transaction.ingested
- document.uploaded
- document.quarantined
- document.extracted
- data_quality.issue_detected

## Application
- application.created
- application.submitted
- application.information_required
- application.manual_review
- application.approved
- application.declined
- application.cancelled

## Decision
- affordability.completed
- credit.assessed
- fraud.assessed
- aml.alerted
- exposure.calculated
- policy.evaluated
- pricing.calculated
- decision.completed
- decision.overridden

## Offer/Contract
- offer.created
- offer.expired
- offer.accepted
- contract.created
- contract.signed

## Lending
- loan.created
- loan.approved
- loan.disbursement_requested
- loan.disbursement_pending
- loan.disbursed
- loan.past_due
- loan.defaulted
- loan.restructured
- loan.settled

## Payments
- payment.initiated
- payment.pending
- payment.succeeded
- payment.failed
- payment.unknown
- payment.reversed
- payment.reconciled

## Ledger
- ledger.transaction_posted
- ledger.transaction_reversed
- accounting.journal_posted
- reconciliation.exception_opened
- reconciliation.exception_resolved

## Collections
- collection.case_opened
- collection.case_updated
- collection.promise_created
- collection.promise_fulfilled
- collection.promise_broken

## Credit reporting
- credit_report.snapshot_created
- credit_report.submitted
- credit_report.acknowledged
- credit_report.reconciled
- credit_report.disputed
- credit_report.corrected

## Security
- fraud.action_taken
- security.incident_opened
- privileged_access.granted
- privileged_access.revoked
- kill_switch.activated
- kill_switch.deactivated

## Event rules

1. Events are facts, not commands.
2. Events are immutable.
3. Consumers are idempotent.
4. Outbox is committed in the same database transaction as the authoritative state change.
5. Delivery is at-least-once.
6. Event ordering is guaranteed only within an aggregate stream where explicitly designed.
7. Consumers must tolerate duplicates and late events.
8. PII is minimized in events; reference IDs are preferred.
9. Event schemas are versioned; breaking changes require a new major event version.
