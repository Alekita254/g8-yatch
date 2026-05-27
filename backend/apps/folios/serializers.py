from rest_framework import serializers

from .models import Folio, FolioLine


class FolioLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = FolioLine
        fields = ["id", "line_type", "description", "amount", "reference", "created_at"]


class FolioSerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source="business_partner.display_name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    reservation_number = serializers.CharField(source="reservation.reservation_number", read_only=True)
    lines = FolioLineSerializer(many=True, read_only=True)

    class Meta:
        model = Folio
        fields = [
            "id",
            "folio_number",
            "reservation",
            "reservation_number",
            "business_partner",
            "guest_name",
            "room",
            "room_number",
            "status",
            "charge_total",
            "payment_total",
            "balance_due",
            "lines",
            "opened_at",
            "closed_at",
        ]
        read_only_fields = ["folio_number", "charge_total", "payment_total", "balance_due", "opened_at", "closed_at"]
