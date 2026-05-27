from django.contrib import admin

from .models import Role, ServicePoint, UserIdentity


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "sync_to_keycloak", "is_active")
    list_filter = ("sync_to_keycloak", "is_active")
    search_fields = ("name", "key", "description")
    readonly_fields = ("created_at", "updated_at")


@admin.register(ServicePoint)
class ServicePointAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "kind", "mac_address", "location", "is_active")
    list_filter = ("kind", "is_active")
    search_fields = ("name", "code", "mac_address", "location")
    readonly_fields = ("created_at", "updated_at")


@admin.register(UserIdentity)
class UserIdentityAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "keycloak_sub", "is_active", "last_seen_at")
    list_filter = ("is_active",)
    search_fields = ("email", "username", "keycloak_sub")
    readonly_fields = ("created_at", "updated_at", "last_seen_at")
