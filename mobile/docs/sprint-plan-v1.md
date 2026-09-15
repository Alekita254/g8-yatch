# Android POS V1 Execution Backlog

This is the frozen execution backlog for V1 delivery.

Rules:

1. No feature outside the V1 Scope Freeze in mobile/README.md.
2. Any exception requires explicit scope approval and pilot impact statement.
3. Work is pulled in this order only after previous gate is passed.

V1 pilot definition:

Login -> Select service point -> Products -> Cart -> Order -> Payment -> Receipt -> Print -> Sync

## Gate 0: Backend Safety for Core Flow

Backlog items:

1. BE-P0-01: Order idempotency
2. BE-P0-02: Payment idempotency
3. BE-P0-05: Sensitive action permission hardening
4. BE-P0-03: Service-point access filtering
5. BE-P0-04: Replay semantics and error codes

Entry criteria:

- API routes confirmed in mobile/docs/api-contract-map.md.

Exit criteria:

- All P0 backend items completed and test-covered.

## Gate 1: Mobile Foundation

Backlog items:

1. MB-P0-01: React Native TypeScript app scaffold
2. MB-P0-02: Environment config (API base URL, Keycloak realm/client)
3. MB-P0-03: OIDC login/logout + token refresh
4. MB-P0-04: Secure token storage and logout cleanup
5. MB-P0-05: Profile and permission bootstrap via /api/users/me/

Entry criteria:

- Gate 0 complete.

Exit criteria:

- Authenticated user reaches role-aware POS entry screen.

## Gate 2: POS Core Workflow

Backlog items:

1. MB-P0-06: Service-point selection and persistence
2. MB-P0-07: Product categories and product list with search
3. MB-P0-08: Cart and local line editing UX
4. MB-P0-09: Order create and update draft
5. MB-P0-10: Order submit and server confirmation state

Entry criteria:

- Gate 1 complete.

Exit criteria:

- User can create and submit a valid order on tablet in a live test.

## Gate 3: Payments, Receipt, and Print

Backlog items:

1. MB-P0-11: Payment methods fetch and selection
2. MB-P0-12: Payment create with idempotency key
3. MB-P0-13: Receipt retrieval and view state
4. MB-P0-14: Receipt print dispatch through PrinterManager

Entry criteria:

- Gate 2 complete.

Exit criteria:

- Completed payment is visible in backend and printed receipt matches transaction.

## Gate 4: Offline Recovery and Synchronization

Backlog items:

1. MB-P0-19: SQLite cache for products, categories, service points
2. MB-P0-20: Mutation queue for order/payment writes
3. MB-P0-21: Sync worker with retry/backoff
4. MB-P0-22: Sync conflict and failure UX
5. MB-P0-23: Connectivity and sync indicators

Entry criteria:

- Gate 3 complete.

Exit criteria:

- Offline order/payment flow syncs safely without duplicate financial entries.

## Gate 5: Pilot Readiness

Backlog items:

1. MB-P0-24: Crash/error logging with redaction
2. MB-P0-25: Tablet layout polish for live cashier use
3. MB-P0-26: Device and printer test matrix sign-off
4. MB-P0-27: Side-by-side runbook versus existing web POS
5. MB-P0-28: Pilot APK build and deployment checklist

Entry criteria:

- Gate 4 complete.

Exit criteria:

- Pilot acceptance criteria met on a real hotel tablet and real 80mm printer.

## Deferred Backlog (Locked for V1.1+)

- Receipt reprint history UI
- Table management extensions
- Kitchen display system
- Split payments
- Barcode/camera scanning
- Shift open/close and reconciliation
- Device fleet management
