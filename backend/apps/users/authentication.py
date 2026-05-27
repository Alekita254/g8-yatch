from dataclasses import dataclass

import jwt
from django.conf import settings
from django.utils import timezone
from jwt import PyJWKClient
from rest_framework import authentication, exceptions

from .models import UserIdentity


@dataclass
class KeycloakPrincipal:
    keycloak_sub: str
    email: str
    username: str
    realm_roles: list[str]
    claims: dict
    identity: UserIdentity | None = None

    @property
    def is_authenticated(self):
        return True

    @property
    def id(self):
        return self.keycloak_sub


class KeycloakJWTAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode("utf-8")
        if not header:
            return None

        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            raise exceptions.AuthenticationFailed("Invalid Authorization header.")

        token = parts[1]
        claims = self._decode_token(token)
        principal = self._principal_from_claims(claims)
        principal.identity = self._sync_identity(principal)
        return principal, claims

    def _decode_token(self, token):
        try:
            jwks_client = PyJWKClient(settings.KEYCLOAK_JWKS_URL)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK_AUDIENCE,
                issuer=settings.KEYCLOAK_ISSUER,
                options={"require": ["exp", "iat", "iss", "sub"]},
            )
        except jwt.PyJWTError as exc:
            raise exceptions.AuthenticationFailed("Invalid Keycloak token.") from exc

    def _principal_from_claims(self, claims):
        roles = claims.get("realm_access", {}).get("roles", [])
        return KeycloakPrincipal(
            keycloak_sub=claims["sub"],
            email=claims.get("email", ""),
            username=claims.get("preferred_username", ""),
            realm_roles=roles,
            claims=claims,
        )

    def _sync_identity(self, principal):
        identity, _ = UserIdentity.objects.update_or_create(
            keycloak_sub=principal.keycloak_sub,
            defaults={
                "email": principal.email,
                "username": principal.username,
                "realm_roles": principal.realm_roles,
                "last_seen_at": timezone.now(),
            },
        )
        return identity
