# G8 Yacht Desktop App

This Electron wrapper packages the existing React frontend as a Windows desktop application.

## Build Windows Installer

From `frontend/`:

```bash
npm run build:desktop:win
```

Outputs are written to:

```text
frontend/release/
```

The app bundles the frontend files locally and talks to the configured backend API. Set production frontend env vars before building if needed, for example:

```bash
VITE_API_URL=https://g8-backend.getotech.co.ke npm run build:desktop:win
```

When running as a packaged desktop app, the frontend defaults to:

```text
API: https://g8-backend.getotech.co.ke
Keycloak: https://identy.getotech.co.ke
```

Add this redirect URI to the Keycloak `pos-terminal` client before giving the desktop build to users:

```text
app://g8/*
```

## Local Smoke Test

```bash
npm run build
npm run desktop
```

The desktop shell loads the built `dist/` frontend through a local secure `app://g8/` protocol.
