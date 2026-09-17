# Backend API Contract Map (Current Repo)

This map lists routes that are already implemented in this repository and are directly relevant to Android POS.

Base prefixes are wired in backend/core/urls.py:

- /api/users/
- /api/products/
- /api/sales/
- /api/payments/
- /api/folios/
- /api/reservations/
- /api/rooms/

## 1. Auth and Identity

From backend/apps/users/urls.py:

- GET /api/users/me/
- GET /api/users/service-points/
- GET /api/users/service-points/{id}/

Notes:

- Password login endpoint in backend/apps/users/views.py returns 405 and indicates Keycloak token flow is required.

## 2. Products

From backend/apps/products/urls.py:

- GET/POST /api/products/categories/
- GET/PATCH/DELETE /api/products/categories/{id}/
- GET/POST /api/products/items/
- GET/PATCH/DELETE /api/products/items/{id}/
- GET/POST /api/products/sales-pricelists/
- GET/PATCH/DELETE /api/products/sales-pricelists/{id}/
- GET/POST /api/products/purchase-pricelists/
- GET/PATCH/DELETE /api/products/purchase-pricelists/{id}/

## 3. Sales and POS Core

From backend/apps/sales/urls.py:

Orders:

- GET/POST /api/sales/orders/
- GET/PATCH /api/sales/orders/{id}/
- POST /api/sales/orders/{id}/send/
- POST /api/sales/orders/{id}/status/
- POST /api/sales/orders/{id}/items/{itemId}/void/
- GET /api/sales/orders/{id}/receipts/
- POST /api/sales/orders/{id}/invoice/

Invoices:

- GET /api/sales/invoices/
- GET /api/sales/invoices/{id}/
- GET /api/sales/invoices/{id}/invoice/
- GET /api/sales/invoices/{id}/receipt/

Payments:

- GET/POST /api/sales/payments/
- GET /api/sales/payments/{id}/
- GET/POST /api/sales/payment-runs/
- POST /api/sales/payment-runs/{id}/apply/

Guest visits:

- GET/POST /api/sales/visits/
- GET /api/sales/visits/{id}/
- POST /api/sales/visits/{id}/waiter-acknowledge/
- POST /api/sales/visits/{id}/checkout/
- GET /api/sales/visits/{id}/invoice/
- GET /api/sales/visits/{id}/receipt/

## 4. Payment Setup Data

From backend/apps/payments/urls.py:

- GET/POST /api/payments/methods/
- GET/PATCH/DELETE /api/payments/methods/{id}/
- GET/POST /api/payments/bank-accounts/
- GET/PATCH/DELETE /api/payments/bank-accounts/{id}/
- GET/POST /api/payments/routing-rules/
- GET/PATCH/DELETE /api/payments/routing-rules/{id}/

## 5. Folios

From backend/apps/folios/urls.py:

- GET/POST /api/folios/
- POST /api/folios/{id}/lines/
- POST /api/folios/{id}/checkout/

## 6. Rooms and Reservations

From backend/apps/rooms/urls.py and backend/apps/reservations/urls.py:

- GET/POST /api/rooms/
- GET/PATCH/DELETE /api/rooms/{id}/
- GET/POST /api/rooms/types/
- GET/PATCH/DELETE /api/rooms/types/{id}/
- GET/POST /api/reservations/
- GET/PATCH/DELETE /api/reservations/{id}/

## 7. API Contract Notes for Mobile

- Mobile should consume paginated responses where present.
- Mobile should not assume hidden UI equals authorization; backend remains authoritative.
- For payment/order safety, idempotency support should be formalized on write endpoints.
