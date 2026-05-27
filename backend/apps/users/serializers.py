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
