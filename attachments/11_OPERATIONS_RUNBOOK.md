# OPERATIONS RUNBOOK

## Incident severity

SEV-0: existential/regulatory/major financial integrity
SEV-1: major customer/financial/security outage
SEV-2: material service degradation
SEV-3: localized issue
SEV-4: minor defect.

## Payment provider outage

1. detect
2. stop unsafe retries
3. preserve pending/unknown states
4. activate provider-specific kill switch if necessary
5. reconcile once provider recovers
6. communicate accurately
7. close only after financial certification.

## Duplicate disbursement suspicion

1. pause disbursement workflow
2. freeze affected customer actions if necessary
3. compare provider references
4. reconcile ledger
5. preserve evidence
6. invoke incident process
7. correct through governed financial entries.

## Fraud incident

1. contain account/session/provider path
2. preserve graph/evidence
3. risk/fraud review
4. customer protection
5. remediate credentials
6. investigate
7. report/escalate where required
8. post-incident review.

## Data breach

1. contain
2. revoke compromised credentials
3. preserve logs/evidence
4. assess affected data
5. invoke privacy/legal/compliance process
6. regulatory/customer notification where required
7. remediation.

## Model incident

1. disable model or route to challenger/manual review
2. preserve affected decision snapshots
3. determine population
4. assess financial/regulatory impact
5. correct forward path
6. govern remediation for affected customers.

## Daily controls

- payment reconciliation
- disbursement reconciliation
- ledger integrity
- failed/unknown payments
- fraud queue
- AML queue
- manual review queue
- privileged access
- system health
- liquidity
- critical data quality.

## Monthly controls

- access review
- vendor risk review
- model monitoring
- policy review
- portfolio review
- complaints review
- regulatory evidence review
- backup restore sample
- reconciliation certification.
