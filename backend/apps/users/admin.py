from django.contrib import admin

from .models import UserIdentity


@admin.register(UserIdentity)
class UserIdentityAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "keycloak_sub", "is_active", "last_seen_at")
    list_filter = ("is_active",)
    search_fields = ("email", "username", "keycloak_sub")
    readonly_fields = ("created_at", "updated_at", "last_seen_at")
