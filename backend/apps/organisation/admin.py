from django.contrib import admin

from .models import Branch, Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "taxpayer_pin", "business_email", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "code", "legal_name", "taxpayer_pin")


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "organization", "location", "is_headquarters", "is_active")
    list_filter = ("organization", "is_headquarters", "is_active")
    search_fields = ("name", "code", "location", "kra_pin")
