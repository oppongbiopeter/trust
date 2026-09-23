# Trust Platform — Complete Database Specification

Production-oriented PostgreSQL database baseline for the Trust lending platform.

## Principles
- PostgreSQL is authoritative for transactional domain state.
- Money is stored as integer minor units plus ISO currency code; never floating point.
- Financial history is append-only and corrected by reversal/correction entries.
- UUIDv7/ULID identifiers are preferred.
- Domain ownership is explicit; cross-domain writes are prohibited.
- Audit records are append-only and separate from application logs.
- Analytics/reporting databases are downstream, never financial system-of-records.
- Consent and permitted-purpose metadata follow sensitive data into the Data Hub.
- Soft deletion is allowed only where business semantics permit it; never for ledger/audit history.
- All financial mutations require idempotency and concurrency controls.
