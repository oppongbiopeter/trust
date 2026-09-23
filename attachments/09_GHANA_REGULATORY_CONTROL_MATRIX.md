# GHANA REGULATORY / COMPLIANCE IMPLEMENTATION MATRIX

This is an engineering control matrix, not legal advice. Counsel and the compliance function must map the final operating model to current Ghana law and regulator requirements before production.

## Current regulatory anchor

BoG published the Digital Credit Services Directive and licensing requirements on September 10, 2026. BoG states that Digital Credit Services are a non-bank financial service and identifies a Digital Credit Services Provider as a licensed corporate entity. citeturn0search0turn0search2turn0search8

BoG's published FAQ identifies, among other instruments, Act 918, Act 774, Act 987, Act 1052, Act 723, Act 992, Act 772, Act 843, Act 865, Act 1038, Act 1044, Act 1015, credit-product disclosure rules and Credit Reporting Regulations 2020 (L.I. 2394) as relevant to the digital-credit regime. citeturn0search26

## Control register

| Area | Engineering control | Evidence |
|---|---|---|
| Licensing | launch blocked until correct licensed entity/permissions confirmed | licence package |
| Customer eligibility | rules engine + identity verification | decision snapshot |
| Identity | verified identity workflow | verification evidence |
| Consumer disclosure | versioned product/offer/contract content | content version |
| Pricing | governed pricing version | pricing approval |
| Affordability | documented methodology | assessment snapshot |
| Automated decisions | reproducible model/policy versions | decision snapshot |
| Human review | reason/evidence/authority captured | audit |
| Data protection | purpose/consent/legal-basis linkage | consent record |
| DPC registration | compliance gate before relevant processing | certificate/evidence |
| DPIA | high-risk profiling/automated decision assessment | DPIA |
| AML | KYC/CDD/monitoring/investigation workflow | compliance case |
| Credit reporting | immutable submission snapshot | bureau record |
| Complaints | case workflow and escalation | support case |
| Outsourcing | vendor/partner due diligence and controls | vendor file |
| Cybersecurity | technical controls + incident workflow | security evidence |
| Audit | append-only evidence | audit store |
| Record retention | retention classes/legal holds | retention registry |
| Reconciliation | daily financial control | reconciliation report |

## Data protection

DPC guidance states that registration is required for data controllers before processing personal data and emphasizes lawfulness, transparency, minimization, purpose limitation and accountability. It also identifies DPIAs for high-risk processing including profiling and automated decision-making. citeturn0search12

Engineering requirements:
- purpose-specific consent
- data minimization
- access controls
- encryption
- retention classification
- subject-right workflow
- processor register
- DPIA evidence
- breach/incident workflow.

## Licensing architecture

If the chosen structure uses a US parent plus Ghana operating/licensing entity, legal counsel must determine the exact regulated Ghana entity and contractual flow before development of live lending operations. Do not assume a US company licensing arrangement substitutes for a Ghana licensing requirement.

## Launch blocker

No live Ghana customer lending until the compliance owner signs the regulatory readiness gate.
