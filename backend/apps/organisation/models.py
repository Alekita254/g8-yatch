from django.db import models


class Organization(models.Model):
    name = models.CharField(max_length=160)
    code = models.SlugField(max_length=80, unique=True)
    legal_name = models.CharField(max_length=180, blank=True)
    taxpayer_pin = models.CharField(max_length=40, blank=True)
    business_email = models.EmailField(blank=True)
    business_phone = models.CharField(max_length=40, blank=True)
    physical_address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Branch(models.Model):
    organization = models.ForeignKey(
        Organization,
        related_name="branches",
        on_delete=models.PROTECT,
    )
    name = models.CharField(max_length=160)
    code = models.SlugField(max_length=80, unique=True)
    branch_type = models.CharField(max_length=80, blank=True)
    location = models.CharField(max_length=180, blank=True)
    kra_pin = models.CharField(max_length=40, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    is_headquarters = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization__name", "name"]

    def __str__(self):
        return f"{self.name} ({self.organization})"
