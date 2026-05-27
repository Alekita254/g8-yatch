const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8081';
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'g8-yacht';
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'pos-terminal';

export const oidcConfig = {
  authority: `${keycloakUrl}/realms/${keycloakRealm}`,
  client_id: keycloakClientId,
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
};
