# Backend Gap Checklist for Android POS V1

This checklist is mapped to current Django files and classes in this repository.

## Priority Legend

- P0: Required before pilot
- P1: Strongly recommended before pilot expansion
- P2: Nice-to-have after initial pilot

## P0-1: Idempotency for Order Creation

Why:

- Prevent duplicate orders during retries/offline replay.

Current implementation references:

- Order create endpoint route: backend/apps/sales/urls.py:34
- Order create logic: backend/apps/sales/views.py:695
- Order model (no client operation key field): backend/apps/sales/models.py:43

Actions:

1. Add idempotency key support for POST /api/sales/orders/.
2. Persist client operation key on SalesOrder (or dedicated idempotency table).
3. Return existing order when same key is replayed.
4. Add unique constraint for idempotency scope.

Acceptance:

- Same key + same payload returns same order, does not create duplicates.

## P0-2: Idempotency for Payment Creation

Why:

- Prevent duplicate financial transactions.

Current implementation references:

- Payment create route: backend/apps/sales/urls.py:45
- Payment create logic: backend/apps/sales/views.py:966
- Payment model (no client operation key field): backend/apps/sales/models.py:167

Actions:

1. Add idempotency key support for POST /api/sales/payments/.
2. Store operation key for each payment submission.
3. Replay-safe responses for duplicate retries.
4. Add tests for payment retry storms.

Acceptance:

- Repeated submission with same key never creates a second payment.

## P0-3: Service-Point Access Filtering by User Permissions

Why:

- Device should only show authorized service points.

Current implementation references:

- Service point routes: backend/apps/users/urls.py:23
- Service point model: backend/apps/users/models.py:21

Actions:

1. Confirm GET /api/users/service-points/ filters by user authorization.
2. If currently unfiltered, add queryset restriction by roles/permissions.
3. Expose clear response for unauthorized service point usage.

Acceptance:

- User only receives service points they are allowed to use.

## P0-4: Offline Replay Result Semantics

Why:

- Mobile sync queue needs deterministic handling for duplicates/conflicts.

Current implementation references:

- Order create flow: backend/apps/sales/views.py:695
- Payment create flow: backend/apps/sales/views.py:966
- Visit checkout flow: backend/apps/sales/views.py:1013

Actions:

1. Standardize API responses for replayed requests (existing, conflict, accepted).
2. Return machine-readable error codes for queue conflict handling.
3. Document retry-safe statuses for mobile sync worker.

Acceptance:

- Mobile can classify server responses into synced, retry, or manual-resolution.

## P0-5: Explicit Permission Coverage for Sensitive Actions

Why:

- Some transactional endpoints currently use generic authenticated access only.

Current implementation references:

- Current role helper: backend/apps/users/permissions.py:1
- Void item endpoint class: backend/apps/sales/views.py:803
- Order status transition endpoint class: backend/apps/sales/views.py:944
- Payment create endpoint class: backend/apps/sales/views.py:966

Actions:

1. Define action-level permission rules for mobile-sensitive operations:
   - void line
   - status override/cancel
   - payment receive
   - receipt reprint
2. Apply explicit permission classes/checks in views.
3. Add tests for forbidden actions per role.

Acceptance:

- Unauthorized users receive 403 on sensitive operations even if UI is bypassed.

## P1-1: Receipt Reprint Audit Marker

Why:

- Supervisory and audit traceability.

Current implementation references:

- Receipt regeneration endpoint: backend/apps/sales/views.py:1030

Actions:

1. Add optional reprint metadata (who, when, why) on reprint operations.
2. Optionally include reprint label in generated output where policy requires.

Acceptance:

- Reprints are distinguishable from original print events in audit trail.

## P1-2: Mobile-Focused Error Code Catalog

Why:

- Improve operational UX and sync handling.

Current implementation references:

- Sales and folio operations:
  - backend/apps/sales/views.py
  - backend/apps/folios/views.py:28
  - backend/apps/folios/views.py:42

Actions:

1. Add consistent error payload format with code + message.
2. Keep user-friendly messages while preserving technical diagnostics server-side.

Acceptance:

- Mobile can map backend errors to actionable user messages.

## P1-3: Folio-Charge Contract Hardening for POS

Why:

- Front desk charging must remain safe and permissioned.

Current implementation references:

- Folio lines endpoint: backend/apps/folios/urls.py:7
- Folio line creation logic: backend/apps/folios/views.py:42

Actions:

1. Confirm POS-specific authorization policy for folio charges and payments.
2. Add idempotency support to folio line create if mobile retries are expected.
3. Add tests for closed folio and duplicate charge submissions.

Acceptance:

- Folio charges are retry-safe and role-safe.

## P2-1: API Versioning Strategy for Mobile Longevity

Why:

- Mobile clients live longer in the field than web deployments.

Current implementation references:

- API root routing: backend/core/urls.py

Actions:

1. Document compatibility guarantees for /api routes.
2. Introduce versioning path/header policy before any breaking changes.

Acceptance:

- Backend changes do not unexpectedly break deployed mobile versions.
