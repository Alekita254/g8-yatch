from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from model_bakery import baker
from rest_framework.test import APIClient

from apps.accounting.views import build_monthly_summary
from apps.payments.models import PaymentMethod
from apps.sales.models import SalesInvoice, SalesPayment


class MonthlyAccountingSummaryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=type("User", (), {"is_authenticated": True})())

        self.invoice = baker.make(
            SalesInvoice,
            invoice_number="INV-TEST-00001",
            subtotal=Decimal("1000.00"),
            tax_total=Decimal("160.00"),
            discount_total=Decimal("60.00"),
            grand_total=Decimal("1100.00"),
            paid_total=Decimal("800.00"),
            balance_due=Decimal("300.00"),
            status=SalesInvoice.Status.PARTIALLY_PAID,
        )
        self.payment_method = baker.make(
            PaymentMethod,
            name="M-Pesa Till",
            code="mpesa-test",
            method_type=PaymentMethod.MethodType.MPESA,
        )
        baker.make(
            SalesPayment,
            invoice=self.invoice,
            payment_method=self.payment_method,
            amount=Decimal("800.00"),
            status=SalesPayment.Status.CLEARED,
        )

    def test_monthly_summary_uses_sales_and_payments(self):
        month_start = timezone.localdate().replace(day=1)
        summary = build_monthly_summary(month_start)

        self.assertEqual(summary["summary"]["sales_total"], "1100.00")
        self.assertEqual(summary["summary"]["collections_total"], "800.00")
        self.assertEqual(summary["by_payment_method"][0]["payment_method"], "M-Pesa Till")

    def test_invalid_month_returns_error_with_reverse(self):
        url = reverse("accounting-monthly-summary")
        response = self.client.get(url, {"month": "July 2026"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["detail"], "Use month in YYYY-MM format.")
