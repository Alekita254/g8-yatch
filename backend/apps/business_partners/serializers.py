from rest_framework import serializers

from .models import BusinessPartner


class BusinessPartnerSerializer(serializers.ModelSerializer):
    partner_type_display = serializers.CharField(source="get_partner_type_display", read_only=True)

    class Meta:
        model = BusinessPartner
        fields = [
            "id",
            "code",
            "partner_type",
            "partner_type_display",
            "display_name",
            "email",
            "phone",
            "nationality",
            "id_document_type",
            "id_document_number",
            "visa_expiry_date",
            "can_charge_to_room",
            "credit_limit",
            "is_active",
        ]
