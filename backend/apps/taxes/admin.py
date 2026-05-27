from django.contrib import admin

from .models import DiscountRule, TaxCategory, TaxConfiguration, TaxOffice


@admin.register(TaxConfiguration)
class TaxConfigurationAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "rate", "calculation_type", "application_order", "is_compound", "is_active")
    list_filter = ("calculation_type", "is_compound", "is_active")
    search_fields = ("name", "code", "ledger_account")


@admin.register(TaxCategory)
class TaxCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "etims_code", "is_default", "is_active")
    list_filter = ("is_default", "is_active")
    search_fields = ("name", "code", "etims_code")
    filter_horizontal = ("taxes",)


@admin.register(TaxOffice)
class TaxOfficeAdmin(admin.ModelAdmin):
    list_display = ("name", "branch_code", "kra_pin", "integration_mode", "is_active")
    list_filter = ("integration_mode", "is_active")
    search_fields = ("name", "branch_code", "kra_pin")


@admin.register(DiscountRule)
class DiscountRuleAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "discount_type", "value", "max_value", "requires_approval", "is_active")
    list_filter = ("discount_type", "requires_approval", "is_active")
    search_fields = ("name", "code", "customer_group")
