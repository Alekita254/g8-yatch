from rest_framework import serializers

from .models import UserIdentity


class UserIdentitySerializer(serializers.ModelSerializer):
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
    realm_roles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        allow_empty=True,
    )
