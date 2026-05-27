from django.db import models


class Reservation(models.Model):
    class Status(models.TextChoices):
        ENQUIRY = "ENQUIRY", "Enquiry"
        TENTATIVE = "TENTATIVE", "Tentative"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CHECKED_IN = "CHECKED_IN", "Checked In"
        CHECKED_OUT = "CHECKED_OUT", "Checked Out"
        CANCELLED = "CANCELLED", "Cancelled"

    reservation_number = models.CharField(max_length=40, unique=True)
    business_partner = models.ForeignKey("business_partners.BusinessPartner", related_name="reservations", on_delete=models.PROTECT)
    room = models.ForeignKey("rooms.Room", related_name="reservations", null=True, blank=True, on_delete=models.PROTECT)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    adults = models.PositiveIntegerField(default=1)
    children = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ENQUIRY)
    source = models.CharField(max_length=80, blank=True)
    channel_reference = models.CharField(max_length=120, blank=True)
    deposit_due_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["check_in_date", "reservation_number"]

    def __str__(self):
        return self.reservation_number
