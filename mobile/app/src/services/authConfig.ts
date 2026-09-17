import Constants from 'expo-constants';

interface AppExtra {
  keycloakAuthority?: string;
  keycloakUrl?: string;
  keycloakRealm?: string;
  keycloakClientId?: string;
  apiBaseUrl?: string;
  authScheme?: string;
  authBypass?: boolean;
}

function readExtra(): AppExtra {
  const extra = Constants.expoConfig?.extra as AppExtra | undefined;
  return extra ?? {};
}

const extra = readExtra();
const fallbackAuthority =
  extra.keycloakUrl && extra.keycloakRealm
    ? `${extra.keycloakUrl}/realms/${extra.keycloakRealm}`
    : undefined;

export const authConfig = {
  keycloakAuthority:
    extra.keycloakAuthority ??
    fallbackAuthority ??
    'https://identy.getotech.co.ke/realms/tendersafi',
  keycloakClientId: extra.keycloakClientId ?? 'oval-frontend',
  authScheme: extra.authScheme ?? 'ovalpos',
  authBypass: extra.authBypass ?? true,
  apiBaseUrl: extra.apiBaseUrl ?? 'http://localhost:8000',
};

export const keycloakIssuer = authConfig.keycloakAuthority;

export const authStorageKeys = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  expiresAt: 'auth.expiresAt',
};
