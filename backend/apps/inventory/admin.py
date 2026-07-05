from django.contrib import admin

from .models import InventoryDocument, InventoryDocumentLine, InventoryThreshold, StockMovement


class InventoryDocumentLineInline(admin.TabularInline):
    model = InventoryDocumentLine
    extra = 0


@admin.register(InventoryThreshold)
class InventoryThresholdAdmin(admin.ModelAdmin):
    list_display = ("product", "minimum_quantity", "reorder_quantity", "is_active")
    list_filter = ("is_active",)
    search_fields = ("product__name", "product__sku")


@admin.register(InventoryDocument)
class InventoryDocumentAdmin(admin.ModelAdmin):
    list_display = ("document_number", "document_type", "status", "supplier_name", "created_at")
    list_filter = ("document_type", "status")
    search_fields = ("document_number", "supplier_name", "notes")
    inlines = [InventoryDocumentLineInline]


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("product", "movement_type", "quantity", "document", "created_at")
    list_filter = ("movement_type",)
    search_fields = ("product__name", "product__sku", "document__document_number")
