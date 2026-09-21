"""Serializer definitions for organizations and branch entities."""

from rest_framework import serializers

from .models import Branch, Organization


class OrganizationSerializer(serializers.ModelSerializer):
    """Serialize organization profiles and summary branch counts."""

    branch_count = serializers.IntegerField(source="branches.count", read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "code",
            "legal_name",
            "taxpayer_pin",
            "business_email",
            "business_phone",
            "physical_address",
            "branch_count",
            "is_active",
        ]


class BranchSerializer(serializers.ModelSerializer):
    """Serialize branch records with parent organization display metadata."""

    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = Branch
        fields = [
            "id",
            "organization",
            "organization_name",
            "name",
            "code",
            "branch_type",
            "location",
            "kra_pin",
            "phone",
            "email",
            "is_headquarters",
            "is_active",
        ]
