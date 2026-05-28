from django.contrib import admin

from .models import (
    BillOfMaterialsItem,
    Product,
    ProductCategory,
    PurchasePricelist,
    PurchasePricelistItem,
    SalesPricelist,
    SalesPricelistItem,
)


class BillOfMaterialsItemInline(admin.TabularInline):
    model = BillOfMaterialsItem
    fk_name = "product"
    extra = 0


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "parent", "tax_code", "tax_rate", "ui_tab", "route_station", "is_active")
    list_filter = ("is_active", "tax_code", "ui_tab")
    search_fields = ("name", "code", "route_station")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "product_type", "category", "quantity", "package_type", "pack_size", "unit", "is_sellable", "is_inventory_tracked", "is_active")
    list_filter = ("product_type", "package_type", "is_sellable", "is_inventory_tracked", "is_active")
    search_fields = ("name", "sku")
    inlines = [BillOfMaterialsItemInline]


class SalesPricelistItemInline(admin.TabularInline):
    model = SalesPricelistItem
    extra = 0


@admin.register(SalesPricelist)
class SalesPricelistAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "service_point", "service_point_kind", "valid_from", "valid_to", "is_active")
    list_filter = ("service_points", "service_point", "service_point_kind", "is_active")
    filter_horizontal = ("service_points",)
    search_fields = ("name", "code")
    inlines = [SalesPricelistItemInline]


class PurchasePricelistItemInline(admin.TabularInline):
    model = PurchasePricelistItem
    extra = 0


@admin.register(PurchasePricelist)
class PurchasePricelistAdmin(admin.ModelAdmin):
    list_display = ("supplier_name", "code", "valid_from", "valid_to", "is_active")
    list_filter = ("is_active",)
    search_fields = ("supplier_name", "code")
    inlines = [PurchasePricelistItemInline]
