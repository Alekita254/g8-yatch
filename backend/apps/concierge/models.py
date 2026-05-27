from django.db import models


class ServiceRequest(models.Model):
    class Department(models.TextChoices):
        HOUSEKEEPING = "HOUSEKEEPING", "Housekeeping"
        MAINTENANCE = "MAINTENANCE", "Maintenance"
        CONCIERGE = "CONCIERGE", "Concierge"
        SECURITY = "SECURITY", "Security"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        NORMAL = "NORMAL", "Normal"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        DISPATCHED = "DISPATCHED", "Dispatched"
        RESOLVED = "RESOLVED", "Resolved"
        ESCALATED = "ESCALATED", "Escalated"

    ticket_number = models.CharField(max_length=40, unique=True)
    room = models.ForeignKey("rooms.Room", related_name="service_requests", null=True, blank=True, on_delete=models.PROTECT)
    business_partner = models.ForeignKey("business_partners.BusinessPartner", related_name="service_requests", null=True, blank=True, on_delete=models.PROTECT)
    department = models.CharField(max_length=30, choices=Department.choices)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.NORMAL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    sla_minutes = models.PositiveIntegerField(default=15)
    escalated_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.ticket_number
