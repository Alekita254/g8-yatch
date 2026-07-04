# G8 Yacht Villa Offline Windows Bundle

This folder documents what the downloadable Windows offline bundle should contain.

The admin Downloads page points to:

```text
/downloads/G8-Yacht-Villa-Offline-Windows.zip
```

or to the URL configured through:

```text
VITE_WINDOWS_OFFLINE_BUNDLE_URL
```

## Bundle Contents

Package these items into the Windows zip:

- Windows desktop app installer from `frontend/release/`
- Backend source or prebuilt backend image
- Local database runtime instructions for Postgres
- Keycloak runtime instructions or image
- Docker Compose file for local/offline startup
- `.env` template for local machine values
- Startup script, such as `start-g8-local.bat`
- Migration and seed/setup instructions

## Build Inputs

From the repository root:

```bash
docker compose -f docker-compose.prod.yml build
cd frontend
npm run build:desktop:win
```

Then create a zip that includes the release installer and the local backend startup files.

## Expected Local URLs

The bundled desktop app should point to the local backend and local identity service:

```text
API: http://localhost:8000
Keycloak: http://localhost:8081
```

The backend stack should run locally, so staff can continue using the system when internet is unavailable.
