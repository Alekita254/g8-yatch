import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

import { authConfig, authStorageKeys, keycloakIssuer } from './authConfig';
import type { AuthTokens } from '../types/auth';

WebBrowser.maybeCompleteAuthSession();

function buildRedirectUri(): string {
  return AuthSession.makeRedirectUri({
    scheme: authConfig.authScheme,
    path: 'auth/callback',
  });
}

async function buildDiscovery() {
  return AuthSession.fetchDiscoveryAsync(keycloakIssuer);
}

function requireCode(result: AuthSession.AuthSessionResult): string {
  if (result.type !== 'success' || !result.params.code) {
    throw new Error('Authentication was cancelled or incomplete.');
  }
  return result.params.code;
}

export async function signInWithKeycloak(): Promise<AuthTokens> {
  const redirectUri = buildRedirectUri();
  const discovery = await buildDiscovery();

  const request = new AuthSession.AuthRequest({
    clientId: authConfig.keycloakClientId,
    responseType: AuthSession.ResponseType.Code,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
    redirectUri,
  });

  const authResult = await request.promptAsync(discovery);
  const code = requireCode(authResult);

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: authConfig.keycloakClientId,
      code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier || '',
      },
    },
    discovery,
  );

  return {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresAt: tokenResponse.issuedAt
      ? tokenResponse.issuedAt + (tokenResponse.expiresIn ?? 0)
      : undefined,
  };
}

export async function openKeycloakSignUp(): Promise<void> {
  const signUpUrl = `${keycloakIssuer}/protocol/openid-connect/registrations?client_id=${authConfig.keycloakClientId}&response_type=code&scope=openid`;
  await WebBrowser.openBrowserAsync(signUpUrl);
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await SecureStore.setItemAsync(authStorageKeys.accessToken, tokens.accessToken);
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync(authStorageKeys.refreshToken, tokens.refreshToken);
  }
  if (tokens.expiresAt) {
    await SecureStore.setItemAsync(authStorageKeys.expiresAt, String(tokens.expiresAt));
  }
}

export async function loadTokens(): Promise<AuthTokens | null> {
  const accessToken = await SecureStore.getItemAsync(authStorageKeys.accessToken);
  if (!accessToken) {
    return null;
  }

  const refreshToken = await SecureStore.getItemAsync(authStorageKeys.refreshToken);
  const expiresAtRaw = await SecureStore.getItemAsync(authStorageKeys.expiresAt);

  return {
    accessToken,
    refreshToken: refreshToken ?? undefined,
    expiresAt: expiresAtRaw ? Number(expiresAtRaw) : undefined,
  };
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(authStorageKeys.accessToken);
  await SecureStore.deleteItemAsync(authStorageKeys.refreshToken);
  await SecureStore.deleteItemAsync(authStorageKeys.expiresAt);
}
