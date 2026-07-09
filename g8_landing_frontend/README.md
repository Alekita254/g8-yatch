# G8 Yatch Landing Frontend

Standalone mobile-first public website for G8 Yatch food ordering, hotel
accommodation, conferences, garden events, team building, family activities,
and cabro-block sales in Embu.

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
- `VITE_GOOGLE_MAP_QUERY`: Exact Google Maps place name or Embu address for the embedded preview.
- `VITE_GOOGLE_MAP_EMBED_URL`: Exact Google Maps iframe `src` for the G8 place preview.
- `VITE_GOOGLE_MAP_URL`: Exact Google Maps share link used by location and directions buttons.
- `VITE_MENU_PRICELIST_CODE`: Public menu pricelist code.
- `VITE_HOTEL_ENQUIRIES_ENDPOINT`: ERP/CRM endpoint for room enquiries.
- `VITE_WAITER_ALERT_ENDPOINT`: Optional waiter-arrival notification endpoint.
- `VITE_CONTACT_PHONE` and `VITE_CONTACT_EMAIL`: Verified public contacts.

Hospitality orders are already shaped for `POST /api/sales/orders/`. The CRM
and dedicated cabro contracts are configurable because those backend endpoints
do not currently exist.

## Replacing Website Photos

All major landing photos are controlled from one file:

```bash
src/data/siteImages.js
```

Use this workflow:

1. Add the real G8 photo to:

```bash
public/images/g8/
```

2. Open:

```bash
public/images/g8/UPLOAD-GUIDE.md
```

3. Match the photo to the section slot and recommended filename.
4. Update the matching `src` in `src/data/siteImages.js`.

Each image slot includes `usedOn` and `why` notes so it is clear which photo belongs in each section and what job that image is doing.
