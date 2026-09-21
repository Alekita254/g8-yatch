"""Serializer definitions for identities, roles, service points, and admin user actions."""

from rest_framework import serializers

from .models import Role, ServicePoint, UserIdentity


class RoleSerializer(serializers.ModelSerializer):
    """Serialize role definitions and permission mappings."""

    class Meta:
        model = Role
        fields = [
            "id",
            "key",
            "name",
            "description",
            "permissions",
            "sync_to_keycloak",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ServicePointSerializer(serializers.ModelSerializer):
    """Serialize service point records used by operational workspaces."""

    kind_display = serializers.CharField(source="get_kind_display", read_only=True)

    class Meta:
        model = ServicePoint
        fields = [
            "id",
            "name",
            "code",
            "kind",
            "kind_display",
            "mac_address",
            "location",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "kind_display", "created_at", "updated_at"]


class UserIdentitySerializer(serializers.ModelSerializer):
    """Read-only serializer for synchronized Keycloak user identity data."""

    class Meta:
        model = UserIdentity
        fields = [
            "keycloak_sub",
            "email",
            "username",
            "first_name",
            "last_name",
            "realm_roles",
            "is_active",
            "last_seen_at",
        ]
        read_only_fields = fields


class AdminUserCreateSerializer(serializers.Serializer):
    """Validate payload for creating a new user in Keycloak."""

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(max_length=128, write_only=True)
    realm_roles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        required=False,
        default=list,
    )


class AdminUserRoleSerializer(serializers.Serializer):
    """Validate role replacement payload for an existing user."""

    realm_roles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        allow_empty=True,
    )


class AdminUserUpdateSerializer(serializers.Serializer):
    """Validate optional profile updates for a managed user."""

    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)


class AdminUserPasswordResetSerializer(serializers.Serializer):
    """Validate admin-initiated password reset requests."""

    password = serializers.CharField(max_length=128, min_length=8, write_only=True)
    temporary = serializers.BooleanField(default=True)
