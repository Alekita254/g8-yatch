from django.db import models


class TaxConfiguration(models.Model):
    class CalculationType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage"
        FIXED = "FIXED", "Fixed Amount"

    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=80, unique=True)
    rate = models.DecimalField(max_digits=8, decimal_places=3, default=0)
    calculation_type = models.CharField(
        max_length=20,
        choices=CalculationType.choices,
        default=CalculationType.PERCENTAGE,
    )
    application_order = models.PositiveIntegerField(default=1)
    is_compound = models.BooleanField(default=False)
    ledger_account = models.CharField(max_length=80, blank=True)
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["application_order", "name"]

    def __str__(self):
        return self.name


class TaxCategory(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, unique=True)
    etims_code = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    taxes = models.ManyToManyField(TaxConfiguration, related_name="categories", blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code", "name"]
        verbose_name_plural = "tax categories"

    def __str__(self):
        return f"{self.code} - {self.name}"


class TaxOffice(models.Model):
    class IntegrationMode(models.TextChoices):
        CLOUD_ETIMS = "CLOUD_ETIMS", "Cloud eTIMS"
        OSCU_DEVICE = "OSCU_DEVICE", "OSCU Device"
        MANUAL = "MANUAL", "Manual Filing"

    name = models.CharField(max_length=140)
    branch_code = models.CharField(max_length=80)
    kra_pin = models.CharField(max_length=40)
    integration_mode = models.CharField(
        max_length=20,
        choices=IntegrationMode.choices,
        default=IntegrationMode.CLOUD_ETIMS,
    )
    endpoint_url = models.URLField(blank=True)
    routing_key = models.CharField(max_length=120, blank=True)
    certificate_alias = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["branch_code", "name"]
        unique_together = [("branch_code", "kra_pin")]

    def __str__(self):
        return f"{self.name} ({self.branch_code})"


class DiscountRule(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage"
        FIXED = "FIXED", "Fixed Amount"

    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=80, unique=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE,
    )
    value = models.DecimalField(max_digits=12, decimal_places=2)
    max_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    requires_approval = models.BooleanField(default=False)
    allowed_roles = models.JSONField(default=list, blank=True)
    service_point_kinds = models.JSONField(default=list, blank=True)
    customer_group = models.CharField(max_length=80, blank=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
