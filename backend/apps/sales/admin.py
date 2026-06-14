from django.contrib import admin

from .models import CustomerPaymentRun, CustomerPaymentRunAllocation, GuestVisit, SalesInvoice, SalesOrder, SalesOrderItem, SalesPayment


@admin.register(GuestVisit)
class GuestVisitAdmin(admin.ModelAdmin):
    list_display = ("visit_number", "service_area", "table_name", "guest_name", "status", "arrived_at")
    list_filter = ("status", "service_area")
    search_fields = ("visit_number", "guest_name", "phone", "table_name")


class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 0


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "visit", "status", "service_point", "table_name", "customer_name", "grand_total", "created_at")
    list_filter = ("status", "service_point")
    search_fields = ("order_number", "customer_name", "table_name")
    inlines = [SalesOrderItemInline]


class SalesPaymentInline(admin.TabularInline):
    model = SalesPayment
    extra = 0


@admin.register(SalesInvoice)
class SalesInvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "customer_name", "grand_total", "paid_total", "balance_due", "status", "etims_status")
    list_filter = ("status", "etims_status")
    search_fields = ("invoice_number", "customer_name")
    inlines = [SalesPaymentInline]


class CustomerPaymentRunAllocationInline(admin.TabularInline):
    model = CustomerPaymentRunAllocation
    extra = 0


@admin.register(CustomerPaymentRun)
class CustomerPaymentRunAdmin(admin.ModelAdmin):
    list_display = ("run_number", "customer_name", "amount", "unapplied_amount", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("run_number", "customer_name")
    inlines = [CustomerPaymentRunAllocationInline]
