import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  clearTokens,
  loadTokens,
  openKeycloakSignUp,
  saveTokens,
  signInWithKeycloak,
} from '../services/authService';
import { authConfig } from '../services/authConfig';
import { fetchMyProfile } from '../services/userService';
import type { AuthProfile, AuthTokens, AuthViewState } from '../types/auth';

interface UseAuthSessionResult extends AuthViewState {
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

function isTokenExpired(tokens: AuthTokens): boolean {
  if (!tokens.expiresAt) {
    return false;
  }
  return tokens.expiresAt <= Math.floor(Date.now() / 1000);
}

async function hydrateProfile(tokens: AuthTokens): Promise<AuthProfile> {
  if (isTokenExpired(tokens)) {
    throw new Error('Session expired. Please sign in again.');
  }
  return fetchMyProfile(tokens.accessToken);
}

function buildMockProfile(): AuthProfile {
  return {
    identity: {
      keycloak_sub: 'dev-user',
      email: 'cashier@oval.app',
      username: 'cashier',
      first_name: 'Oval',
      last_name: 'Operator',
    },
    roles: ['POS_MANAGER'],
    permissions: ['app.sales', 'app.frontdesk', 'app.inventory'],
  };
}

export function useAuthSession(): UseAuthSessionResult {
  const [isBootstrapping, setBootstrapping] = useState(true);
  const [isAuthenticating, setAuthenticating] = useState(false);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
    setBootstrapping(true);
    try {
      const tokens = await loadTokens();
      if (!tokens) {
        setProfile(null);
        return;
      }
      const nextProfile = await hydrateProfile(tokens);
      setProfile(nextProfile);
    } catch {
      await clearTokens();
      setProfile(null);
    } finally {
      setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(async () => {
    setAuthenticating(true);
    setErrorMessage(null);

    try {
      if (authConfig.authBypass) {
        setProfile(buildMockProfile());
        return;
      }

      const tokens = await signInWithKeycloak();
      await saveTokens(tokens);
      const nextProfile = await hydrateProfile(tokens);
      setProfile(nextProfile);
    } catch {
      await clearTokens();
      setProfile(null);
      setErrorMessage('Sign in failed. Check network or Keycloak configuration.');
    } finally {
      setAuthenticating(false);
    }
  }, []);

  const signUp = useCallback(async () => {
    setErrorMessage(null);

    if (authConfig.authBypass) {
      setProfile(buildMockProfile());
      return;
    }

    await openKeycloakSignUp();
  }, []);

  const signOut = useCallback(async () => {
    await clearTokens();
    setProfile(null);
  }, []);

  return useMemo(
    () => ({
      isBootstrapping,
      isAuthenticating,
      isAuthenticated: Boolean(profile),
      profile,
      errorMessage,
      signIn,
      signUp,
      signOut,
    }),
    [errorMessage, isAuthenticating, isBootstrapping, profile, signIn, signOut, signUp],
  );
}
