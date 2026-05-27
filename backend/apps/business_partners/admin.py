from django.contrib import admin

from .models import BusinessPartner


@admin.register(BusinessPartner)
class BusinessPartnerAdmin(admin.ModelAdmin):
    list_display = ("display_name", "code", "partner_type", "email", "phone", "can_charge_to_room", "is_active")
    list_filter = ("partner_type", "can_charge_to_room", "is_active")
    search_fields = ("display_name", "code", "email", "phone")
