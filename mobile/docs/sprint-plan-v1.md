# Android POS V1 Sprint Plan

## Sprint 0: Foundation and Contracts

- Confirm endpoint contracts from mobile/docs/api-contract-map.md.
- Close P0 backend gaps for idempotency and permissions.
- Define auth and environment configuration strategy.
- Decide first pilot devices and printer models.

Deliverables:

- Backend gap tickets approved and prioritized.
- Mobile project scaffold ready.

## Sprint 1: Auth and Session Bootstrap

- OIDC login/logout flow.
- Token persistence and refresh.
- Fetch /api/users/me and resolve permission-gated app actions.
- Service-point selection and local persistence.

Deliverables:

- Authenticated shell with role-aware navigation.

## Sprint 2: Products and Cart

- Category/product browse + search.
- Cart state with quantity updates and line remove.
- Local calculations for UX only (backend remains source of truth).

Deliverables:

- Working order draft flow with touch-first UI.

## Sprint 3: Orders, Payments, Receipts

- Create/hold/submit order via /api/sales/orders and related actions.
- Payment flow via /api/sales/payments.
- Receipt retrieval + print dispatch abstraction.
- Reprint from transaction history.

Deliverables:

- End-to-end POS transaction on Android.

## Sprint 4: Offline and Sync

- SQLite cache for products/categories/service points.
- Mutation queue for order/payment operations.
- Sync worker with retries, backoff, and visible failure state.

Deliverables:

- Offline-safe order capture and eventual sync.

## Sprint 5: Pilot Hardening

- Device and printer real-world testing.
- Crash/error telemetry with redaction.
- UX improvements for cashier speed.

Deliverables:

- Pilot APK for controlled hotel rollout.
