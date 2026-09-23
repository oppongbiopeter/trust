# SECURITY THREAT MODEL

## Threat model assumption

Assume credentials, devices, APIs, providers and internal accounts can eventually be compromised. Design for containment and evidence.

## Assets

- identity
- Ghana Card/identity references
- authentication credentials
- financial data
- documents
- applications
- model/policy configuration
- offers/contracts
- loan state
- payment instructions
- ledger
- treasury
- audit evidence
- customer communications
- employee privileges.

## Major threats

### Account takeover
Controls:
MFA/step-up, device risk, velocity, session revocation, anomaly detection, customer alerts.

### API abuse
Controls:
authentication, authorization, schema validation, rate limits, idempotency, replay protection, WAF.

### Privilege escalation
Controls:
RBAC/ABAC, least privilege, JIT, four-eyes, privileged session logging, periodic review.

### Insider financial manipulation
Controls:
segregation of duties, immutable ledger, maker-checker, anomaly detection, dual approval.

### Provider compromise
Controls:
isolated adapters, credential rotation, signed/webhook verification, allowlists, reconciliation.

### Document fraud
Controls:
malware scanning, hash, OCR confidence, tamper/anomaly detection, cross-source verification.

### Synthetic identity
Controls:
identity verification, graph analytics, device/account linkage, velocity and manual review.

### Payment duplication
Controls:
idempotency, provider reference uniqueness, state machine, reconciliation.

### Unknown payment ambiguity
Controls:
UNKNOWN state, provider query, reconciliation, funding reservation controls, no blind retry.

### Data exfiltration
Controls:
encryption, tokenization, DLP, egress restrictions, scoped access, export approvals, monitoring.

### Ransomware
Controls:
immutable backups, isolated backup credentials, restore drills, segmentation, endpoint controls.

### Supply-chain attack
Controls:
SBOM, dependency scanning, signed artifacts, provenance, locked versions, vendor review.

### Model manipulation
Controls:
registry, approval workflow, signed artifacts, production allowlist, model hash, rollback.

### Policy manipulation
Controls:
versioning, maker-checker, effective dates, simulation, approval, immutable history.

## Kill switches

PAUSE_NEW_APPLICATIONS
PAUSE_AUTO_APPROVAL
PAUSE_DISBURSEMENTS
PAUSE_PROVIDER_X
PAUSE_PRODUCT_X
PAUSE_AUTOMATED_COLLECTIONS
PAUSE_PAYMENT_ALLOCATION
PAUSE_MODEL_X
PAUSE_WORKFLOW_X
LOCK_CUSTOMER_ACCOUNT
REVOKE_CUSTOMER_SESSIONS
DISABLE_PROVIDER_CREDENTIAL

Every kill switch:
- named owner
- trigger conditions
- scope
- activation authority
- expiry/review
- alerting
- audit event
- recovery procedure.

## Security acceptance

No critical/high unresolved vulnerability for production launch unless formally risk-accepted by authorized governance.
