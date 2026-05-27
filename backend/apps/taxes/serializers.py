from rest_framework import serializers

from .models import DiscountRule, TaxCategory, TaxConfiguration, TaxOffice


class TaxConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxConfiguration
        fields = [
            "id",
            "name",
            "code",
            "rate",
            "calculation_type",
            "application_order",
            "is_compound",
            "ledger_account",
            "effective_from",
            "effective_to",
            "is_active",
        ]


class TaxCategorySerializer(serializers.ModelSerializer):
    tax_names = serializers.SerializerMethodField()

    class Meta:
        model = TaxCategory
        fields = [
            "id",
            "name",
            "code",
            "etims_code",
            "description",
            "taxes",
            "tax_names",
            "is_default",
            "is_active",
        ]

    def get_tax_names(self, obj):
        return [tax.name for tax in obj.taxes.all()]


class TaxOfficeSerializer(serializers.ModelSerializer):
    integration_mode_display = serializers.CharField(source="get_integration_mode_display", read_only=True)

    class Meta:
        model = TaxOffice
        fields = [
            "id",
            "name",
            "branch_code",
            "kra_pin",
            "integration_mode",
            "integration_mode_display",
            "endpoint_url",
            "routing_key",
            "certificate_alias",
            "is_active",
        ]


class DiscountRuleSerializer(serializers.ModelSerializer):
    discount_type_display = serializers.CharField(source="get_discount_type_display", read_only=True)

    class Meta:
        model = DiscountRule
        fields = [
            "id",
            "name",
            "code",
            "discount_type",
            "discount_type_display",
            "value",
            "max_value",
            "requires_approval",
            "allowed_roles",
            "service_point_kinds",
            "customer_group",
            "valid_from",
            "valid_to",
            "is_active",
        ]

    def to_internal_value(self, data):
        mutable = data.copy()
        for field in ("allowed_roles", "service_point_kinds"):
            value = mutable.get(field)
            if isinstance(value, str):
                mutable[field] = [item.strip() for item in value.split(",") if item.strip()]
        return super().to_internal_value(mutable)
