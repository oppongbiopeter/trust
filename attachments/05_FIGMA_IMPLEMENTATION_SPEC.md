# FIGMA / PRODUCT DESIGN IMPLEMENTATION SPECIFICATION

This is the source-of-truth specification a product designer should turn into a Figma file. It intentionally separates UX from decision logic.

## Figma file structure

00 Cover
01 Foundations
02 Components
03 Patterns
04 Customer — Authentication
05 Customer — Verification
06 Customer — Financial Profile
07 Customer — Trust
08 Customer — Products
09 Customer — Application
10 Customer — Decision/Offer
11 Customer — Contract
12 Customer — Loan
13 Customer — Payments
14 Customer — Collections
15 Customer — Support
16 Customer — Security
17 Admin — Operations
18 Admin — Credit
19 Admin — Fraud/AML
20 Admin — Finance
21 Admin — Reconciliation
22 Admin — Governance
23 Admin — Model Risk
24 Responsive
25 Accessibility
26 Content/Localization
27 Prototype flows
28 Developer handoff

## Customer navigation

HOME / TRUST / LOANS / PAYMENTS / HELP

## Customer screens

Authentication:
Splash, welcome, phone, OTP, password/PIN/security setup, recovery, device verification.

Identity:
Identity overview, Ghana Card/identity verification, verification pending, failed, manual review, completed.

Financial:
Financial profile, connect account, upload statement, income, expenses, business profile, document review, data quality.

Trust:
Trust overview, history, positive behaviors, factors, data permissions, profile freshness.

Credit:
Products, eligibility, application, amount, term, purpose, affordability, review, processing, manual review, decision.

Offer:
Approval, offer details, fees, repayment total, due dates, conditions, accept, contract, signing.

Loan:
Loan dashboard, schedule, payment, receipt, payment pending, payment unknown, completed, overdue, hardship/restructure request.

Support:
Help, support case, complaint, status, secure messaging.

## Required states for every high-risk screen

Loading
Empty
Offline
Retry
Error
Access denied
Information required
Pending
Success
Failed
Unknown
Restricted

## Design principles

- One primary action per screen.
- Never hide cost, due date or repayment obligation.
- Distinguish pending from success.
- Use plain-language financial explanations.
- Do not use shame, threats or manipulative urgency.
- Collections UI must prioritize resolution and support.
- Accessibility target: WCAG 2.2 AA where applicable.
- Localization architecture must support English and future Ghana-relevant language expansion.
- Sensitive information is masked by default.
- Never display OTP/password secrets.
- Deep links must land in authenticated context for sensitive actions.

## Admin information hierarchy

Dashboard → Queue → Customer/Application → Evidence → Decision → Action → Audit.

Every operational detail page should expose:
- current state
- timeline
- evidence
- data freshness
- model/policy versions
- decisions
- human actions
- audit trail
- permitted next actions.

## Design tokens

Define:
- typography scale
- spacing scale
- radius
- elevation
- iconography
- semantic status tokens
- form validation
- tables
- pagination
- alerts
- dialogs
- drawers
- timelines
- evidence cards
- risk badges.

Avoid encoding business logic in visual components.
