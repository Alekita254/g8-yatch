import json
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import Mock

from django.test import SimpleTestCase

from .views import build_fiscal_payload


class BuildFiscalPayloadTests(SimpleTestCase):
    def test_decimal_values_are_json_serializable_strings(self):
        items = Mock()
        items.exclude.return_value.values.return_value = [
            {
                "product_id": 7,
                "quantity": Decimal("2.000"),
                "unit_price": Decimal("350.00"),
                "line_total": Decimal("700.00"),
            }
        ]
        order = SimpleNamespace(order_number="SO-20260614-00001", items=items)

        payload = build_fiscal_payload(order)

        self.assertEqual(
            payload,
            {
                "order_number": "SO-20260614-00001",
                "items": [
                    {
                        "product_id": 7,
                        "quantity": "2.000",
                        "unit_price": "350.00",
                        "line_total": "700.00",
                    }
                ],
            },
        )
        self.assertIsInstance(json.dumps(payload), str)
