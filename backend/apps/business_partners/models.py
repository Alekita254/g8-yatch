from django.db import models


class BusinessPartner(models.Model):
    class PartnerType(models.TextChoices):
        GUEST = "GUEST", "Guest"
        CORPORATE = "CORPORATE", "Corporate Client"
        TRAVEL_AGENT = "TRAVEL_AGENT", "Travel Agent"
        SUPPLIER = "SUPPLIER", "Supplier"
        STAFF = "STAFF", "Staff"

    code = models.SlugField(max_length=80, unique=True)
    partner_type = models.CharField(max_length=30, choices=PartnerType.choices, default=PartnerType.GUEST)
    display_name = models.CharField(max_length=180)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    nationality = models.CharField(max_length=80, blank=True)
    id_document_type = models.CharField(max_length=40, blank=True)
    id_document_number = models.CharField(max_length=180, blank=True)
    visa_expiry_date = models.DateField(null=True, blank=True)
    can_charge_to_room = models.BooleanField(default=False)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_name"]

    def __str__(self):
        return self.display_name
