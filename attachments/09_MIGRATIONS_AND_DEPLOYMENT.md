# 09 — Migration and Deployment Strategy

## Migration pattern

### 1. EXPAND
Add nullable/new structures, indexes concurrently where appropriate, and compatibility code.

### 2. MIGRATE
Backfill in bounded batches with checkpoints. Never hold long blocking transactions.

### 3. VERIFY
Compare counts, hashes, financial totals and domain invariants.

### 4. SWITCH
Enable new read/write path behind a feature flag.

### 5. CONTRACT
Remove deprecated structures only after rollback window and evidence review.

## Production migration rules

- Every migration is version controlled.
- One-way migrations must have a tested recovery plan.
- No destructive migration during peak lending/payment windows.
- Ledger migrations require Finance + Engineering + Risk/Ops signoff.
- Reconciliation before and after financial migrations.
- Backups/restore points verified before risky changes.
- Schema changes tested against realistic production-scale data.
- Long-running backfills use resumable jobs.

## Rollback

Application rollback is preferred over database rollback where financial state may already have changed.

If a financial defect occurred:
1. stop affected workflow/provider/model/policy
2. identify impacted records
3. preserve evidence
4. reconcile
5. create governed corrections/reversals
6. remediate
7. document incident.

Never restore an old database snapshot over newer financial history as a casual rollback mechanism.
