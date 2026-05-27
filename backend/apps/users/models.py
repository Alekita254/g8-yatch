from django.db import models


class Role(models.Model):
    key = models.CharField(max_length=80, unique=True)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=list, blank=True)
    sync_to_keycloak = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ServicePoint(models.Model):
    class Kind(models.TextChoices):
        POS_TERMINAL = "POS_TERMINAL", "POS Terminal"
        FRONTDESK = "FRONTDESK", "Frontdesk"
        BAR = "BAR", "Bar"
        RESTAURANT = "RESTAURANT", "Restaurant"
        WORKSHOP = "WORKSHOP", "Workshop"
        MARINA = "MARINA", "Marina"

    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=80, unique=True)
    kind = models.CharField(max_length=40, choices=Kind.choices)
    mac_address = models.CharField(max_length=64, blank=True, unique=True, null=True)
    location = models.CharField(max_length=160, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["kind", "name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class UserIdentity(models.Model):
    keycloak_sub = models.CharField(max_length=255, unique=True)
    email = models.EmailField(blank=True)
    username = models.CharField(max_length=150, blank=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    realm_roles = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["email", "username"]

    def __str__(self):
        return self.email or self.username or self.keycloak_sub
