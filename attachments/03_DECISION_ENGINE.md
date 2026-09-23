# DECISION ENGINE — PRODUCTION SPECIFICATION

## Objective

Produce a reproducible, governed decision for each application without allowing a model to silently become the policy.

Pipeline:

DATA → QUALITY → FEATURES → AFFORDABILITY → CREDIT → FRAUD → AML → EXPOSURE → POLICY → PRICING → DECISION → HUMAN REVIEW IF REQUIRED → OFFER.

## Decision snapshot

Every completed decision stores:
- application ID
- customer ID
- input data snapshot/hash
- feature snapshot/hash
- data freshness
- consent/legal basis references
- affordability version
- credit model/version
- fraud model/version
- AML policy/version
- exposure policy/version
- product version
- policy version
- pricing version
- final recommendation
- reason codes
- decision timestamp
- decision expiry
- actor/system identity.

## Decision outcomes

- APPROVE
- APPROVE_WITH_CONDITIONS
- MANUAL_REVIEW
- INFORMATION_REQUIRED
- DECLINE
- HOLD_SECURITY
- HOLD_COMPLIANCE

## Affordability

Calculate:
- verified recurring income
- conservative variable income
- business revenue
- business costs
- household obligations
- existing debt service
- expected new debt service
- buffer/stress factor
- sustainable repayment capacity.

Never equate transaction volume with income.

## Credit

Inputs can include:
- verified repayment history
- bureau data
- income stability
- affordability
- existing exposure
- account behavior
- product-specific history
- thin-file indicators.

Output is an internal risk assessment, not the customer Trust Score.

## Fraud

Signals:
- identity anomalies
- device/account relationships
- velocity
- payment destination risk
- application patterns
- document tampering
- synthetic identity indicators
- account takeover signals.

Actions:
ALLOW / STEP_UP / MONITOR / HOLD / MANUAL_REVIEW / LIMIT / RESTRICT / BLOCK / LOCK / CASE / INCIDENT.

## AML

AML is not just a score. It is a controlled compliance workflow:
KYC/KYB → CDD/EDD → screening → transaction monitoring → alert → investigation → disposition → authorized reporting where required.

## Policy

Policy engine determines whether a recommendation is permitted.

Example:
IF product.active
AND customer.verified
AND required_consent.active
AND affordability.pass
AND fraud.action NOT IN [BLOCK,LOCK]
AND aml.status = CLEAR
AND exposure.within_limit
AND application.within_product_bounds
THEN decision may be APPROVE.

## Human override

An override requires:
- authorized role
- reason
- evidence
- original decision
- new decision
- policy basis
- timestamp
- expiry if applicable
- second approval where threshold requires it.

A human override does not modify the original model result.

## Model governance

IDEA → DEVELOPMENT → VALIDATION → MODEL RISK REVIEW → APPROVAL → CANARY → PRODUCTION → MONITORING → REVIEW → RETIRE.

Production models require:
- training-data lineage
- validation report
- performance metrics
- fairness/bias review as applicable
- stability monitoring
- drift thresholds
- rollback model
- owner
- expiry/review date.

## Decision monitoring

Monitor:
- approval rate
- manual-review rate
- decline rate
- fraud interception
- bad-rate by cohort
- affordability exceptions
- overrides
- drift
- data-quality degradation
- model latency
- decision reproducibility failures.

No automatic policy relaxation based solely on portfolio pressure.
