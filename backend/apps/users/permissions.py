"""Custom DRF permissions backed by Keycloak realm roles."""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class HasRealmRole(BasePermission):
    """Grant access when user realm roles intersect required roles."""

    required_roles = set()

    def has_permission(self, request, view):
        """Evaluate required roles defined on the view or permission class."""
        required_roles = set(getattr(view, "required_roles", self.required_roles))
        if not required_roles:
            return True

        user_roles = set(getattr(request.user, "realm_roles", []))
        return bool(required_roles.intersection(user_roles))


class IsPosManager(HasRealmRole):
    """Restrict access to users with the POS_MANAGER realm role."""

    required_roles = {"POS_MANAGER"}


class IsPosManagerOrReadOnly(HasRealmRole):
    """Allow read-only requests for all users, writes for POS managers only."""

    required_roles = {"POS_MANAGER"}

    def has_permission(self, request, view):
        """Bypass role checks for safe methods and enforce on mutating methods."""
        if request.method in SAFE_METHODS:
            return True
        return super().has_permission(request, view)
