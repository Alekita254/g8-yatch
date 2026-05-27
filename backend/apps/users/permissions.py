from rest_framework.permissions import BasePermission


class HasRealmRole(BasePermission):
    required_roles = set()

    def has_permission(self, request, view):
        required_roles = set(getattr(view, "required_roles", self.required_roles))
        if not required_roles:
            return True

        user_roles = set(getattr(request.user, "realm_roles", []))
        return bool(required_roles.intersection(user_roles))


class IsPosManager(HasRealmRole):
    required_roles = {"POS_MANAGER"}
