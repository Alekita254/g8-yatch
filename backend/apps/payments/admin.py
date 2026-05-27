from django.contrib import admin

from .models import BankAccount, PaymentMethod, PaymentRoutingRule


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "method_type", "opens_cash_drawer", "requires_customer", "is_active")
    list_filter = ("method_type", "opens_cash_drawer", "requires_customer", "is_active")
    search_fields = ("name", "code")


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "account_type", "ledger_account", "currency", "is_active")
    list_filter = ("account_type", "currency", "is_active")
    search_fields = ("name", "code", "bank_name", "account_number", "till_number")


@admin.register(PaymentRoutingRule)
class PaymentRoutingRuleAdmin(admin.ModelAdmin):
    list_display = ("payment_method", "bank_account", "service_point", "service_point_kind", "priority", "is_active")
    list_filter = ("payment_method", "bank_account", "service_point_kind", "is_active")
    search_fields = ("payment_method__name", "bank_account__name", "service_point__name")
