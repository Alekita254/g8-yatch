"""Keycloak JWT authentication backend for DRF requests."""

from dataclasses import dataclass
from urllib.parse import urlparse, urlunparse

import jwt
from django.conf import settings
from django.utils import timezone
from jwt import PyJWKClient
from rest_framework import authentication, exceptions

from .models import UserIdentity


@dataclass
class KeycloakPrincipal:
    """Lightweight authenticated principal derived from Keycloak token claims."""

    keycloak_sub: str
    email: str
    username: str
    first_name: str
    last_name: str
    realm_roles: list[str]
    claims: dict
    identity: UserIdentity | None = None

    @property
    def is_authenticated(self):
        """Expose DRF/Django-compatible authenticated flag."""
        return True

    @property
    def id(self):
        """Expose a stable principal id based on Keycloak subject."""
        return self.keycloak_sub


class KeycloakJWTAuthentication(authentication.BaseAuthentication):
    """Validate Keycloak Bearer tokens and map them to local user identities."""

    keyword = "Bearer"

    def authenticate(self, request):
        """Authenticate request using Authorization Bearer token."""
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
        """Verify token signature, issuer, required claims, and audience."""
        try:
            claims = jwt.decode(token, options={"verify_signature": False})
            issuer = claims.get("iss", settings.KEYCLOAK_ISSUER)
            signing_key = self._get_signing_key(token, issuer)
            verified_claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=settings.KEYCLOAK_ISSUER,
                options={
                    "require": ["exp", "iat", "iss", "sub"],
                    "verify_aud": False,
                },
            )

            self._validate_audience(verified_claims)
            return verified_claims
        except jwt.PyJWTError as exc:
            if settings.DEBUG:
                raise exceptions.AuthenticationFailed(
                    f"Invalid Keycloak token: {exc}"
                ) from exc
            raise exceptions.AuthenticationFailed("Invalid Keycloak token.") from exc

    def _validate_audience(self, claims):
        """Accept tokens whose aud/azp intersects configured Keycloak audiences."""
        accepted_audiences = set(
            getattr(settings, "KEYCLOAK_AUDIENCES", [settings.KEYCLOAK_AUDIENCE])
        )
        accepted_audiences.add(getattr(settings, "KEYCLOAK_AUDIENCE", ""))
        accepted_audiences = {aud for aud in accepted_audiences if aud}

        aud_claim = claims.get("aud", [])
        if isinstance(aud_claim, str):
            token_audiences = {aud_claim}
        else:
            token_audiences = {aud for aud in aud_claim if isinstance(aud, str)}

        authorized_party = claims.get("azp")
        if isinstance(authorized_party, str):
            token_audiences.add(authorized_party)

        if not token_audiences.intersection(accepted_audiences):
            raise jwt.InvalidAudienceError(
                (
                    "Token audience mismatch. "
                    f"Expected one of {sorted(accepted_audiences)}; "
                    f"received aud={claims.get('aud')} azp={claims.get('azp')}"
                )
            )

    def _get_signing_key(self, token, issuer):
        """Fetch the matching JWKS signing key for the incoming token."""
        jwks_urls = [
            settings.KEYCLOAK_JWKS_URL,
            f"{issuer.rstrip('/')}/protocol/openid-connect/certs",
        ]

        parsed = urlparse(issuer)
        if parsed.hostname == "localhost":
            netloc = parsed.netloc.replace("localhost", "127.0.0.1", 1)
            fallback_issuer = urlunparse(parsed._replace(netloc=netloc))
            jwks_urls.append(f"{fallback_issuer.rstrip('/')}/protocol/openid-connect/certs")

        last_error = None
        for jwks_url in dict.fromkeys(jwks_urls):
            try:
                return PyJWKClient(jwks_url).get_signing_key_from_jwt(token)
            except Exception as exc:
                last_error = exc

        raise jwt.PyJWTError(f"Unable to fetch Keycloak JWKS: {last_error}")

    def _principal_from_claims(self, claims):
        """Build a KeycloakPrincipal object from verified JWT claims."""
        roles = claims.get("realm_access", {}).get("roles", [])
        return KeycloakPrincipal(
            keycloak_sub=claims["sub"],
            email=claims.get("email", ""),
            username=claims.get("preferred_username", ""),
            first_name=claims.get("given_name", ""),
            last_name=claims.get("family_name", ""),
            realm_roles=roles,
            claims=claims,
        )

    def _sync_identity(self, principal):
        """Create or update local UserIdentity record from authenticated principal."""
        identity, created = UserIdentity.objects.get_or_create(
            keycloak_sub=principal.keycloak_sub,
            defaults={
                "email": principal.email,
                "username": principal.username,
                "first_name": principal.first_name,
                "last_name": principal.last_name,
                "realm_roles": principal.realm_roles,
                "last_seen_at": timezone.now(),
            },
        )
        if not created:
            identity.email = principal.email
            identity.username = principal.username
            if principal.first_name:
                identity.first_name = principal.first_name
            if principal.last_name:
                identity.last_name = principal.last_name
            identity.realm_roles = principal.realm_roles
            identity.last_seen_at = timezone.now()
            identity.save(
                update_fields=[
                    "email",
                    "username",
                    "first_name",
                    "last_name",
                    "realm_roles",
                    "last_seen_at",
                    "updated_at",
                ]
            )
        return identity
