from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("reservation_number", "business_partner", "room", "check_in_date", "check_out_date", "status")
    list_filter = ("status", "source")
    search_fields = ("reservation_number", "business_partner__display_name", "channel_reference")
