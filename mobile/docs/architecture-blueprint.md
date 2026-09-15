# Android POS Architecture Blueprint

## 1. Principles

1. Django backend owns business logic and authorization.
2. Android app owns UX, local state, device integration, and offline sync.
3. No duplicated tax/payment/authorization logic on device.
4. Every write operation should carry a client-generated operation id.

## 2. Mobile Stack

- React Native + TypeScript
- Expo prebuild workflow (recommended for speed)
- React Navigation
- Axios for HTTP
- SQLite for offline cache and mutation queue
- Secure token storage for OIDC tokens
- NetInfo for online/offline state
- PrinterManager abstraction for ESC/POS adapters

## 3. High-Level Modules

- app/core/auth
  - OIDC login/logout, refresh, secure token persistence
- app/core/api
  - Axios instance, auth header injection, error normalization
- app/core/permissions
  - map backend permissions to UI capabilities
- app/core/storage
  - encrypted secure storage + SQLite layer
- app/core/sync
  - queued mutations, retry/backoff, dedupe, conflict handling
- app/features/session
  - service-point selection, cashier session bootstrap
- app/features/products
  - categories, searchable product list, local cache
- app/features/orders
  - cart, order lifecycle, hold/submit, status updates
- app/features/payments
  - payment method selection, payment create, confirmation
- app/features/receipts
  - receipt rendering model, reprint actions, printer dispatch
- app/features/history
  - recent transactions, search/filter, sync state badges
- app/features/printers
  - printer setup and diagnostics

## 4. Sync Model

Each mutable action creates a queue item:

- queue_item_id: local UUID
- operation_type: create_order | submit_order | create_payment | void_item | checkout_visit
- operation_key: idempotency key (sent to backend)
- payload: API payload
- state: pending | syncing | synced | failed
- retries: integer
- last_error: string

Sync worker behavior:

1. Run in background when network is available.
2. Pull oldest pending item.
3. Submit with idempotency key.
4. Mark synced on server acknowledgement.
5. Retry with exponential backoff on transient failures.
6. Keep failed operations visible for manual retry.

## 5. Printer Abstraction

Printer interface contract:

- connect()
- disconnect()
- testPrint()
- printReceipt(receiptData)
- printKitchenTicket(ticketData)
- cut()

Implementations:

- LanEscPosPrinter
- BluetoothEscPosPrinter
- UsbEscPosPrinter (optional for later)

## 6. UI Layout Strategy

Phone:

- stacked screens, full-screen cart/order entry

Tablet:

- split view layout (categories/products on left, active cart on right)

## 7. Security Controls

- Tokens in secure storage only
- HTTPS only
- redact sensitive logs (tokens, credentials, references)
- clear local auth/session data on logout
- minimize cached personally identifiable data

## 8. V1 Delivery Boundaries

In:

- auth + permissions
- service-point selection
- products + search
- order create/update/submit
- payment create
- receipt print/reprint
- offline cache + queue + sync status

Out:

- advanced admin setup
- deep accounting setup
- full system reporting
