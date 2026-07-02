from calendar import monthrange
from datetime import datetime, time
from decimal import Decimal

from django.db.models import Count, DecimalField, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.sales.models import SalesInvoice, SalesPayment


MONEY_ZERO = Decimal("0.00")
MONEY_OUTPUT = DecimalField(max_digits=14, decimal_places=2)


def zero_value():
    return Value(MONEY_ZERO, output_field=MONEY_OUTPUT)


def parse_month(value):
    if value:
        return datetime.strptime(value, "%Y-%m").date().replace(day=1)
    today = timezone.localdate()
    return today.replace(day=1)


def month_bounds(month_start):
    month_end = month_start.replace(day=monthrange(month_start.year, month_start.month)[1])
    active_timezone = timezone.get_current_timezone()
    start = timezone.make_aware(datetime.combine(month_start, time.min), active_timezone)
    end = timezone.make_aware(datetime.combine(month_end, time.max), active_timezone)
    return start, end, month_end


def money(value):
    return str((value or MONEY_ZERO).quantize(MONEY_ZERO))


def invoice_queryset_for_month(month_start):
    start, end, month_end = month_bounds(month_start)
    return (
        SalesInvoice.objects.filter(created_at__range=(start, end))
        .select_related("branch", "order", "order__service_point")
        .prefetch_related("payments__payment_method")
    ), start, end, month_end


def bucket_sum(queryset, field):
    return queryset.aggregate(total=Coalesce(Sum(field), zero_value(), output_field=MONEY_OUTPUT))["total"]


def build_monthly_summary(month_start):
    invoices, start, end, month_end = invoice_queryset_for_month(month_start)
    payments = SalesPayment.objects.filter(
        created_at__range=(start, end),
        status=SalesPayment.Status.CLEARED,
    ).select_related("payment_method", "invoice")
    open_invoices = SalesInvoice.objects.filter(balance_due__gt=0)

    sales_total = bucket_sum(invoices, "grand_total")
    paid_total = bucket_sum(invoices, "paid_total")
    balance_due = bucket_sum(invoices, "balance_due")
    collections_total = bucket_sum(payments, "amount")

    by_branch = [
        {
            "branch": row["branch__name"] or "Unassigned branch",
            "invoice_count": row["invoice_count"],
            "sales_total": money(row["sales_total"]),
            "tax_total": money(row["tax_total"]),
            "balance_due": money(row["balance_due"]),
        }
        for row in invoices.values("branch__name")
        .annotate(
            invoice_count=Count("id"),
            sales_total=Coalesce(Sum("grand_total"), zero_value(), output_field=MONEY_OUTPUT),
            tax_total=Coalesce(Sum("tax_total"), zero_value(), output_field=MONEY_OUTPUT),
            balance_due=Coalesce(Sum("balance_due"), zero_value(), output_field=MONEY_OUTPUT),
        )
        .order_by("branch__name")
    ]

    by_service_point = [
        {
            "service_point": row["order__service_point__name"] or "Unassigned service point",
            "sales_total": money(row["sales_total"]),
            "tax_total": money(row["tax_total"]),
            "invoice_count": row["invoice_count"],
        }
        for row in invoices.values("order__service_point__name")
        .annotate(
            invoice_count=Count("id"),
            sales_total=Coalesce(Sum("grand_total"), zero_value(), output_field=MONEY_OUTPUT),
            tax_total=Coalesce(Sum("tax_total"), zero_value(), output_field=MONEY_OUTPUT),
        )
        .order_by("order__service_point__name")
    ]

    by_payment_method = [
        {
            "payment_method": row["payment_method__name"] or "Unassigned payment method",
            "payment_count": row["payment_count"],
            "collections_total": money(row["collections_total"]),
        }
        for row in payments.values("payment_method__name")
        .annotate(
            payment_count=Count("id"),
            collections_total=Coalesce(Sum("amount"), zero_value(), output_field=MONEY_OUTPUT),
        )
        .order_by("payment_method__name")
    ]

    tax_lines = [
        {
            "label": "Output VAT / sales tax",
            "amount": money(bucket_sum(invoices, "tax_total")),
            "basis": "Invoice tax totals issued during the selected month",
        },
        {
            "label": "Taxable sales before tax",
            "amount": money(bucket_sum(invoices, "subtotal")),
            "basis": "Invoice subtotals issued during the selected month",
        },
        {
            "label": "Discounts granted",
            "amount": money(bucket_sum(invoices, "discount_total")),
            "basis": "Invoice discounts issued during the selected month",
        },
    ]

    return {
        "period": {
            "month": month_start.strftime("%Y-%m"),
            "label": month_start.strftime("%B %Y"),
            "start_date": month_start.isoformat(),
            "end_date": month_end.isoformat(),
        },
        "summary": {
            "invoice_count": invoices.count(),
            "sales_total": money(sales_total),
            "subtotal": money(bucket_sum(invoices, "subtotal")),
            "tax_total": money(bucket_sum(invoices, "tax_total")),
            "discount_total": money(bucket_sum(invoices, "discount_total")),
            "paid_total": money(paid_total),
            "collections_total": money(collections_total),
            "balance_due": money(balance_due),
            "open_receivables_total": money(bucket_sum(open_invoices, "balance_due")),
            "open_receivables_count": open_invoices.count(),
        },
        "tax_lines": tax_lines,
        "by_branch": by_branch,
        "by_service_point": by_service_point,
        "by_payment_method": by_payment_method,
    }


class MonthlyAccountingSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            month_start = parse_month(request.query_params.get("month"))
        except ValueError:
            return Response({"detail": "Use month in YYYY-MM format."}, status=400)

        return Response(build_monthly_summary(month_start))
