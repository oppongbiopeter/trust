# 12 — Recommended Build Sequence

1. Platform schemas: platform, audit, security.
2. Identity/customer/consent.
3. Business/KYB.
4. Data Hub/documents/data quality.
5. Products/policy/pricing.
6. Application.
7. Affordability/credit/fraud/AML/exposure.
8. Offers/contracts.
9. Lending.
10. Payments.
11. Ledger.
12. Treasury/accounting/reconciliation.
13. Collections/support/notifications.
14. Credit reporting.
15. Workforce/partner/vendor controls.
16. Reporting projections and warehouse feeds.

## Required companion artifacts

The database specification should now be followed by:
- OpenAPI 3.1 contract
- complete event/schema registry
- decision-engine specification
- chart of accounts + journal-entry catalog
- Figma screen implementation package
- engineering backlog
- security threat model
- Terraform/Kubernetes deployment package

## Definition of Done for database

- all authoritative entities have owners
- every financial amount has currency + integer minor unit
- critical relationships use foreign keys
- critical uniqueness has database constraints
- financial history is append-only
- idempotency exists for financial commands
- outbox/inbox exists
- audit exists
- migrations are tested
- restore has been tested
- reconciliation exists
- data quality monitors exist
- retention classes are documented
- production access is controlled
