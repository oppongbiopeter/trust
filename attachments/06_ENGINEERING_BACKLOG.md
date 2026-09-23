# ENGINEERING BACKLOG

## Epic 0 — Governance/Foundation
- repository structure
- coding standards
- ADR process
- branch protection
- CI/CD
- secrets management
- observability
- environment strategy
- regulatory evidence repository

## Epic 1 — Identity
Stories:
- registration
- authentication
- MFA/OTP
- session lifecycle
- recovery
- device binding
- identity verification
- identity audit

Acceptance:
- no authentication secret stored in plaintext
- session revocation works
- suspicious authentication can trigger step-up.

## Epic 2 — Customer/Consent
- profile
- consent
- purpose limitation
- consent revocation
- customer data export/access workflow
- retention classification.

## Epic 3 — Data Hub
- provider adapters
- source connections
- transaction normalization
- document upload
- malware scanning
- OCR/extraction
- data-quality scoring
- lineage.

## Epic 4 — Lending
- products
- applications
- affordability
- credit
- fraud
- AML
- exposure
- policy
- pricing
- decision orchestrator.

## Epic 5 — Offer/Contract
- offer generation
- expiry
- acceptance
- contract generation
- signature evidence.

## Epic 6 — Money
- funding reservation
- disbursement
- payment initiation
- provider adapters
- UNKNOWN state
- ledger
- accounting
- reconciliation.

## Epic 7 — Collections
- delinquency
- cases
- promises
- payment allocation
- hardship
- restructuring
- settlement.

## Epic 8 — Trust/Credit Reporting
- Trust profile
- Trust Score
- credit history
- bureau snapshot
- reporting
- dispute
- correction.

## Epic 9 — Operations
- queues
- cases
- customer support
- complaints
- approvals
- four-eyes controls.

## Epic 10 — Risk/Compliance
- AML
- fraud graph
- sanctions screening integration
- regulatory evidence
- model governance
- policy governance.

## Epic 11 — Security
- WAF
- IAM
- JIT privilege
- device risk
- secrets
- encryption
- SAST/DAST
- dependency/container scanning
- SIEM/SOC integration
- incident response.

## Epic 12 — Finance/Treasury
- chart of accounts
- journals
- treasury
- liquidity
- month-end
- tax
- reconciliations.

## Epic 13 — Analytics
- warehouse
- source registry
- metric registry
- dashboards
- portfolio monitoring.

## Epic 14 — Production Readiness
- load testing
- chaos testing
- restore test
- DR exercise
- red team
- penetration test
- reconciliation certification
- regulatory readiness.

## Definition of Done for every story

Code + tests + telemetry + authorization + audit impact + migration + documentation + rollback/compensation behavior + security review where relevant + product acceptance.

## Critical dependency order

Foundation → Identity → Consent → Data → Products/Policy → Decisioning → Offer → Contract → Money → Collections → Reporting → Production certification.
