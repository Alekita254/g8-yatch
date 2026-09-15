from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from model_bakery import baker
from rest_framework.test import APIClient

from apps.payments.models import PaymentMethod
from apps.products.models import Product, ProductCategory
from apps.sales.models import SalesInvoice, SalesOrder, SalesPayment
from apps.users.models import ServicePoint, UserIdentity


class SalesIdempotencyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = baker.make(UserIdentity, keycloak_sub="staff-sub-001", realm_roles=["POS_MANAGER"])
        self.client.force_authenticate(user=self.user)

        self.service_point = baker.make(
            ServicePoint,
            name="Main Restaurant",
            code="main-restaurant",
            kind=ServicePoint.Kind.RESTAURANT,
        )
        self.category = baker.make(ProductCategory, name="Beverages", code="beverages", tax_rate=Decimal("16.00"))
        self.product = baker.make(
            Product,
            name="Passion Juice",
            sku="PASSION-JUICE",
            product_type=Product.ProductType.BILLABLE,
            category=self.category,
            unit=Product.Unit.EACH,
            is_sellable=True,
            is_active=True,
        )

    def test_order_create_is_idempotent_with_header_key(self):
        payload = {
            "service_point": self.service_point.id,
            "table_name": "T12",
            "customer_name": "Walk-in",
            "items": [
                {
                    "product": self.product.id,
                    "quantity": "2",
                    "unit_price": "350.00",
                }
            ],
        }

        url = reverse("sales-orders")
        first = self.client.post(url, payload, format="json", HTTP_IDEMPOTENCY_KEY="order-op-001")
        second = self.client.post(url, payload, format="json", HTTP_IDEMPOTENCY_KEY="order-op-001")

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(second["X-Idempotent-Replay"], "true")
        self.assertEqual(SalesOrder.objects.count(), 1)

    def test_payment_create_is_idempotent_with_header_key(self):
        order = baker.make(
            SalesOrder,
            order_number="SO-TEST-0001",
            service_point=self.service_point,
            status=SalesOrder.Status.SENT,
            grand_total=Decimal("700.00"),
            subtotal=Decimal("603.45"),
            tax_total=Decimal("96.55"),
            discount_total=Decimal("0.00"),
        )
        invoice = baker.make(
            SalesInvoice,
            order=order,
            invoice_number="SI-TEST-0001",
            grand_total=Decimal("700.00"),
            subtotal=Decimal("603.45"),
            tax_total=Decimal("96.55"),
            discount_total=Decimal("0.00"),
            paid_total=Decimal("0.00"),
            balance_due=Decimal("700.00"),
            status=SalesInvoice.Status.UNPAID,
        )
        method = baker.make(
            PaymentMethod,
            name="Cash",
            code="cash",
            method_type=PaymentMethod.MethodType.CASH,
            is_active=True,
        )

        payload = {
            "invoice": invoice.id,
            "payment_method": method.id,
            "amount": "700.00",
            "currency": "KES",
            "reference": "",
        }

        url = reverse("sales-payments")
        first = self.client.post(url, payload, format="json", HTTP_IDEMPOTENCY_KEY="payment-op-001")
        second = self.client.post(url, payload, format="json", HTTP_IDEMPOTENCY_KEY="payment-op-001")

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(first.data["id"], second.data["id"])
        self.assertEqual(second["X-Idempotent-Replay"], "true")
        self.assertEqual(SalesPayment.objects.count(), 1)

        invoice.refresh_from_db()
        self.assertEqual(invoice.paid_total, Decimal("700.00"))
        self.assertEqual(invoice.balance_due, Decimal("0.00"))
        self.assertEqual(invoice.status, SalesInvoice.Status.CLOSED)
