from django.db import models


class Folio(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        LOCKED = "LOCKED", "Locked"
        CLOSED = "CLOSED", "Closed"

    folio_number = models.CharField(max_length=40, unique=True)
    reservation = models.OneToOneField("reservations.Reservation", related_name="folio", on_delete=models.PROTECT)
    business_partner = models.ForeignKey("business_partners.BusinessPartner", related_name="folios", on_delete=models.PROTECT)
    room = models.ForeignKey("rooms.Room", related_name="folios", null=True, blank=True, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    charge_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-opened_at"]

    def __str__(self):
        return self.folio_number


class FolioLine(models.Model):
    class LineType(models.TextChoices):
        ROOM_CHARGE = "ROOM_CHARGE", "Room Charge"
        POS_CHARGE = "POS_CHARGE", "POS Charge"
        PAYMENT = "PAYMENT", "Payment"
        ADJUSTMENT = "ADJUSTMENT", "Adjustment"

    folio = models.ForeignKey(Folio, related_name="lines", on_delete=models.CASCADE)
    line_type = models.CharField(max_length=30, choices=LineType.choices)
    description = models.CharField(max_length=180)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reference = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.folio} {self.description}"
