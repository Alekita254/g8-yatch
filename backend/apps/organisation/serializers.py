from rest_framework import serializers

from .models import Branch, Organization


class OrganizationSerializer(serializers.ModelSerializer):
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
