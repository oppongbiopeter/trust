# CLOUD / DEPLOYMENT SPECIFICATION

## Reference architecture

Internet
→ CDN/WAF/DDoS
→ Load Balancer/API Gateway
→ private application network
→ services
→ PostgreSQL/Redis/event bus/object storage
→ workers
→ warehouse.

## Environments

LOCAL
DEV
TEST
STAGING
PILOT
PRODUCTION
DR

Production credentials never cross environment boundaries.

## Kubernetes/container controls

- non-root
- read-only filesystem where feasible
- minimal images
- pinned dependencies
- resource requests/limits
- liveness/readiness/startup probes
- network policies
- service identities
- admission controls
- signed images
- vulnerability scanning
- secrets from managed secret store.

## Infrastructure as code

Terraform modules:
- network
- IAM
- KMS
- cluster
- databases
- cache
- event bus
- object storage
- WAF
- monitoring
- backup
- disaster recovery.

## Database

- Multi-AZ/zone deployment
- encrypted storage
- point-in-time recovery
- tested backups
- restricted network access
- separate migration identity
- read replicas as needed
- connection pooling.

## Secrets

Use cloud secret manager/KMS/HSM capabilities.
No secrets in:
- Git
- images
- frontend bundles
- logs
- analytics exports.

## CI/CD

Commit → review → lint/typecheck → unit → integration → security scans → build → SBOM → container scan → staging → E2E → approval → canary → progressive rollout.

## Observability

OpenTelemetry traces.
Structured logs.
Metrics.
Business metrics.
Audit events.
Alerts.

Separate:
- technical logs
- business events
- audit records.

## Disaster recovery

Define RPO/RTO per service. Financial systems receive the strictest recovery objectives.

Run:
- backup restore
- regional failure simulation
- provider outage
- event-bus outage
- database failover
- credential compromise
- ransomware exercise.

## Rollback

Application rollback first.
Financial corrections via ledger reversal/correction.
Never erase history to restore a previous state.
