from django.db import models


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
