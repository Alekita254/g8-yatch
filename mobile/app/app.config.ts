import type { ExpoConfig } from 'expo/config';

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : fallback;
}

function envAny(names: string[], fallback: string): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

const appName = env('EXPO_PUBLIC_APP_NAME', 'Oval');
const appSlug = env('EXPO_PUBLIC_APP_SLUG', 'oval');
const appScheme = env('EXPO_PUBLIC_APP_SCHEME', 'ovalapp');
const apiBaseUrl = envAny(['EXPO_PUBLIC_API_BASE_URL', 'EXPO_PUBLIC_API_URL'], 'http://localhost:8000');
const keycloakUrl = env('EXPO_PUBLIC_KEYCLOAK_URL', 'https://identy.getotech.co.ke');
const keycloakRealm = env('EXPO_PUBLIC_KEYCLOAK_REALM', 'oval');
const keycloakAuthority = envAny(
  ['EXPO_PUBLIC_KEYCLOAK_AUTHORITY', 'KEYCLOAK_AUTHORITY'],
  `${keycloakUrl}/realms/${keycloakRealm}`,
);
const keycloakClientId = envAny(
  ['EXPO_PUBLIC_KEYCLOAK_CLIENT_ID', 'KEYCLOAK_CLIENT_ID'],
  'oval-mobile',
);
const keycloakRedirectUri = envAny(
  ['EXPO_PUBLIC_KEYCLOAK_REDIRECT_URI'],
  `${appScheme}://callback`,
);
const authBypass = envBool('EXPO_PUBLIC_AUTH_BYPASS', true);

const config: ExpoConfig = {
  name: appName,
  slug: appSlug,
  scheme: appScheme,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    keycloakAuthority,
    keycloakUrl,
    keycloakRealm,
    keycloakClientId,
    keycloakRedirectUri,
    apiBaseUrl,
    authScheme: appScheme,
    authBypass,
  },
  plugins: ['expo-secure-store', 'expo-web-browser'],
};

export default config;
