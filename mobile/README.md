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

## Scope Reminder

V1 mobile focuses on operational POS workflows:

- Login and permission-aware access
- Service-point selection
- Product browsing and search
- Order create/edit/submit
- Payments and receipts
- Receipt reprint
- Offline queue and synchronization
- Connectivity and sync status

Admin-heavy setup remains in the existing web app.
