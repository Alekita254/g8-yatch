# Android POS Mobile Workspace

This folder contains the Android POS plan and implementation blueprint for a new React Native client that consumes the existing Django APIs.

## Purpose

- Build a dedicated Android app for tablet and phone POS use.
- Reuse existing backend business rules and permissions.
- Keep backend as single source of truth for orders, payments, folios, taxes, and authorization.

## Documents

- docs/architecture-blueprint.md: mobile architecture and module boundaries.
- docs/api-contract-map.md: exact API routes currently present in this repository.
- docs/backend-gap-checklist.md: backend tasks required for safe mobile rollout, mapped to existing Django files.
- docs/sprint-plan-v1.md: execution sequence for delivery.

## Proposed Repository Structure

project/
|- backend/
|- frontend/
|- g8_landing_frontend/
|- mobile/
|- docs/
|- app/ # React Native application source (to be created)
|- tests/ # mobile tests (to be created)

## V1 Scope Freeze

Pilot definition for V1:

A hotel employee can take an order on an Android tablet, submit it, receive a payment, print a receipt, and recover safely from a temporary network failure.

The only in-scope user flow is:

Login -> Select service point -> Products -> Cart -> Order -> Payment -> Receipt -> Print -> Sync

The following items are locked as V1 in-scope:

- Keycloak login and logout
- Profile/permission bootstrap via /api/users/me/
- Service-point selection and persistence on device
- Product/category loading and search
- Create draft order and submit order
- Record payment
- Fetch receipt and print to 80mm ESC/POS printer (LAN and Bluetooth)
- Offline queue for order/payment when network drops
- Safe sync and duplicate prevention when network returns
- Connectivity and sync state visibility

Everything else is locked out-of-scope for V1.

## Scope Guardrails

Any new feature request is deferred to V1.1 unless all are true:

1. It is required to complete an in-scope V1 workflow.
2. It does not add a new backend domain.
3. It can be delivered within current sprint capacity without moving pilot date.
4. It is approved as a scope exception by product and engineering.

If any condition fails, add it to post-V1 backlog only.
