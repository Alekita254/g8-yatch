from django.contrib import admin

from .models import ServiceRequest


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ("ticket_number", "title", "room", "department", "priority", "status", "created_at")
    list_filter = ("department", "priority", "status")
    search_fields = ("ticket_number", "title", "room__number", "business_partner__display_name")
