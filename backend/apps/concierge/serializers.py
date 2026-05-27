from rest_framework import serializers

from .models import ServiceRequest


class ServiceRequestSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source="room.number", read_only=True)
    guest_name = serializers.CharField(source="business_partner.display_name", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "ticket_number",
            "room",
            "room_number",
            "business_partner",
            "guest_name",
            "department",
            "priority",
            "status",
            "title",
            "description",
            "sla_minutes",
            "escalated_at",
            "resolved_at",
            "created_at",
        ]
        read_only_fields = ["ticket_number", "escalated_at", "resolved_at", "created_at"]
