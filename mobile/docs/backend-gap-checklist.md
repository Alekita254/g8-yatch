# Backend Gap Backlog for Android POS V1

This is the backend execution backlog for the strict V1 pilot.

Pilot success definition:

A hotel employee can take an order on an Android tablet, submit it, receive payment, print receipt, and recover safely after temporary network failure.

## Priority Legend

- P0: Required before pilot
- Deferred: Move to V1.1+

## BE-P0-01: Idempotency for Order Creation

Why:

- Prevent duplicate orders during retries and offline replay.

Current implementation references:

- Order create route: backend/apps/sales/urls.py:34
- Order create logic: backend/apps/sales/views.py:695
- SalesOrder model: backend/apps/sales/models.py:43

Actions:

1. Add idempotency key support for POST /api/sales/orders/.
2. Persist operation key and enforce uniqueness at DB level.
3. Return same order on replay with same key.

Definition of done:

- Replay with same key does not create a second order.
- Tests cover first request and replay.

## BE-P0-02: Idempotency for Payment Creation

Why:

- Prevent duplicate financial transactions.

Current implementation references:

- Payment create route: backend/apps/sales/urls.py:45
- Payment create logic: backend/apps/sales/views.py:966
- SalesPayment model: backend/apps/sales/models.py:167

Actions:

1. Add idempotency key support for POST /api/sales/payments/.
2. Persist operation key and enforce uniqueness.
3. Ensure replay-safe invoice total updates.

Definition of done:

- Duplicate key does not create second payment.
- Invoice paid_total and balance_due remain correct under retries.
- Tests cover retry storms and replay.

## BE-P0-03: Service-Point Access Filtering

Why:

- Tablet user must only select authorized service points.

Current implementation references:

- Service point routes: backend/apps/users/urls.py:23
- ServicePoint model: backend/apps/users/models.py:21

Actions:

1. Enforce authorization filtering on GET /api/users/service-points/.
2. Return 403 for unauthorized service point usage in order/payment flows.

Definition of done:

- Unauthorized service points are not listed.
- Unauthorized usage attempts are blocked.

## BE-P0-04: Replay Semantics for Sync Worker

Why:

- Mobile queue requires deterministic server responses.

Current implementation references:

- Order create flow: backend/apps/sales/views.py:695
- Payment create flow: backend/apps/sales/views.py:966

Actions:

1. Standardize replay responses for accepted, duplicate, and conflict outcomes.
2. Provide machine-readable error codes for non-retryable failures.
3. Document status mapping for mobile sync decisions.

Definition of done:

- Mobile can classify response as synced, retryable, or manual-action.
- Tests validate replay behavior.

## BE-P0-05: Explicit Permission Coverage for V1 Actions

Why:

- V1 needs hard backend enforcement beyond hidden UI.

Current implementation references:

- Permission helper: backend/apps/users/permissions.py:1
- Order create/send views: backend/apps/sales/views.py:695
- Payment create view: backend/apps/sales/views.py:966
- Receipt view: backend/apps/sales/views.py:1030

Actions:

1. Define permission checks for create order, submit order, receive payment, and receipt retrieval.
2. Apply permission checks in views.
3. Add deny-path tests for unauthorized roles.

Definition of done:

- Unauthorized user receives 403 for disallowed V1 actions.
- Tests verify allowed and denied roles.

## Suggested Delivery Order

1. BE-P0-01
2. BE-P0-02
3. BE-P0-03
4. BE-P0-05
5. BE-P0-04

## Deferred Backlog (V1.1+)

- Receipt reprint audit metadata
- Expanded non-V1 error code catalog
- Folio charging hardening for mobile flows
- API versioning policy hardening
- Order status override and void-role matrix expansion
