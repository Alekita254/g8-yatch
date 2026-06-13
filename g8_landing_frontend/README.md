# G8 Yatch Landing Frontend

Standalone mobile-first public website for G8 Yatch food ordering, hotel
accommodation, corporate events, and cabro-block sales in Embu.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment

- `VITE_API_BASE_URL`: Existing Django API origin.
- `VITE_USE_MOCK_DATA`: Keep `true` until public API authentication is ready.
- `VITE_CRM_LEADS_ENDPOINT`: Future ERP CRM lead endpoint.
- `VITE_CABRO_ORDERS_ENDPOINT`: ERP inventory or sales order endpoint.
- `VITE_GOOGLE_MAP_QUERY`: Exact Google Maps place name or Embu address.
- `VITE_MENU_PRICELIST_CODE`: Public menu pricelist code.
- `VITE_HOTEL_ENQUIRIES_ENDPOINT`: ERP/CRM endpoint for room enquiries.
- `VITE_CONTACT_PHONE` and `VITE_CONTACT_EMAIL`: Verified public contacts.

Hospitality orders are already shaped for `POST /api/sales/orders/`. The CRM
and dedicated cabro contracts are configurable because those backend endpoints
do not currently exist.
