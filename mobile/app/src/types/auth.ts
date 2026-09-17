export interface UserIdentity {
  keycloak_sub: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

export interface AuthProfile {
  identity: UserIdentity;
  roles: string[];
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthViewState {
  isBootstrapping: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  profile: AuthProfile | null;
  errorMessage: string | null;
}
