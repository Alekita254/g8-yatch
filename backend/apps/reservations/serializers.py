from rest_framework import serializers

from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source="business_partner.display_name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "reservation_number",
            "business_partner",
            "guest_name",
            "room",
            "room_number",
            "check_in_date",
            "check_out_date",
            "adults",
            "children",
            "status",
            "source",
            "channel_reference",
            "deposit_due_at",
            "notes",
        ]
        read_only_fields = ["reservation_number"]
