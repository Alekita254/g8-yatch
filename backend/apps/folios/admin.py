from django.contrib import admin

from .models import Folio, FolioLine


class FolioLineInline(admin.TabularInline):
    model = FolioLine
    extra = 0


@admin.register(Folio)
class FolioAdmin(admin.ModelAdmin):
    list_display = ("folio_number", "business_partner", "room", "status", "balance_due", "opened_at")
    list_filter = ("status",)
    search_fields = ("folio_number", "business_partner__display_name", "room__number")
    inlines = [FolioLineInline]
