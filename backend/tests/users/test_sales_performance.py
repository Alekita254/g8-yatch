from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from model_bakery import baker
from rest_framework.test import APIClient

from apps.products.models import Product
from apps.sales.models import SalesInvoice, SalesOrder, SalesOrderItem
from apps.users.models import UserIdentity
from apps.users.utils import calculate_company_sales_summary, calculate_user_sales_stats


class StaffSalesPerformanceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = baker.make(
            UserIdentity,
            keycloak_sub="manager-sub-001",
            realm_roles=["POS_MANAGER"],
        )
        self.waiter = baker.make(
            UserIdentity,
            keycloak_sub="waiter-sub-001",
            first_name="Faith",
            last_name="Achieng",
            realm_roles=["WAITER"],
        )
        self.client.force_authenticate(user=self.manager)

        self.product = baker.make(Product, name="Passion Juice", selling_price=Decimal("250.00"))
        self.order = baker.make(
            SalesOrder,
            order_number="SO-TODAY-01",
            waiter_keycloak_sub=self.waiter.keycloak_sub,
            status=SalesOrder.Status.SERVED,
            grand_total=Decimal("580.00"),
        )
        baker.make(
            SalesOrderItem,
            order=self.order,
            product=self.product,
            quantity=Decimal("2.000"),
            line_total=Decimal("500.00"),
        )
        baker.make(
            SalesInvoice,
            order=self.order,
            grand_total=Decimal("580.00"),
            paid_total=Decimal("580.00"),
            balance_due=Decimal("0.00"),
        )

    def test_calculate_user_sales_stats(self):
        stats = calculate_user_sales_stats(self.waiter)
        self.assertEqual(stats["today"]["total_sales"], 580.00)
        self.assertEqual(stats["today"]["order_count"], 1)

    def test_calculate_company_sales_summary(self):
        summary = calculate_company_sales_summary()
        self.assertEqual(summary["today"]["total_sales"], 580.00)
        self.assertEqual(summary["today"]["order_count"], 1)

    def test_sales_summary_endpoint_uses_reverse(self):
        url = reverse("users-sales-performance")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("results", response.data)
        self.assertIn("company_summary", response.data)

    def test_sales_summary_single_user_filter(self):
        url = reverse("users-sales-performance")
        response = self.client.get(url, {"user_id": self.waiter.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["keycloak_sub"], self.waiter.keycloak_sub)
        self.assertEqual(response.data["today"]["total_sales"], 580.00)

    def test_sales_detail_endpoint_uses_reverse(self):
        url = reverse("users-admin-sales-performance", kwargs={"keycloak_sub": self.waiter.keycloak_sub})
        response = self.client.get(url, {"period": "today"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["first_name"], "Faith")
        self.assertEqual(len(response.data["orders"]), 1)
        self.assertEqual(response.data["orders"][0]["order_number"], "SO-TODAY-01")
