from decimal import Decimal

from rest_framework import serializers

from .models import CustomerPaymentRun, GuestVisit, SalesInvoice, SalesOrder, SalesOrderItem, SalesPayment


class SalesOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    service_point_name = serializers.CharField(source="service_point.name", read_only=True)

    class Meta:
        model = SalesOrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "service_point",
            "service_point_name",
            "quantity",
            "unit_price",
            "tax_total",
            "discount_total",
            "line_total",
            "status",
            "routed_station",
            "void_reason",
            "voided_by",
            "sent_at",
            "voided_at",
        ]
        read_only_fields = ["status", "voided_by", "sent_at", "voided_at"]


class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, required=False)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    service_point_name = serializers.CharField(source="service_point.name", read_only=True)
    invoice = serializers.SerializerMethodField()

    class Meta:
        model = SalesOrder
        fields = [
            "id",
            "order_number",
            "visit",
            "branch",
            "branch_name",
            "service_point",
            "service_point_name",
            "table_name",
            "customer_name",
            "waiter_keycloak_sub",
            "status",
            "subtotal",
            "tax_total",
            "discount_total",
            "grand_total",
            "notes",
            "items",
            "invoice",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["order_number", "status", "waiter_keycloak_sub", "created_at", "updated_at"]

    def create(self, validated_data):
        items = validated_data.pop("items", [])
        order = SalesOrder.objects.create(**validated_data)
        for item in items:
            SalesOrderItem.objects.create(order=order, **item)
        return order

    def get_invoice(self, obj):
        if not hasattr(obj, "invoice"):
            return None
        return {
            "id": obj.invoice.id,
            "invoice_number": obj.invoice.invoice_number,
            "grand_total": obj.invoice.grand_total,
            "paid_total": obj.invoice.paid_total,
            "balance_due": obj.invoice.balance_due,
            "status": obj.invoice.status,
        }


class SalesPaymentSerializer(serializers.ModelSerializer):
    payment_method_name = serializers.CharField(source="payment_method.name", read_only=True)

    class Meta:
        model = SalesPayment
        fields = [
            "id",
            "invoice",
            "payment_method",
            "payment_method_name",
            "amount",
            "currency",
            "reference",
            "status",
            "received_by",
            "created_at",
        ]
        read_only_fields = ["received_by", "created_at"]


class SalesInvoiceSerializer(serializers.ModelSerializer):
    payments = SalesPaymentSerializer(many=True, read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    order_number = serializers.CharField(source="order.order_number", read_only=True)
    issued_by = serializers.CharField(read_only=True)

    class Meta:
        model = SalesInvoice
        fields = [
            "id",
            "invoice_number",
            "order",
            "order_number",
            "branch",
            "branch_name",
            "customer_name",
            "issued_by",
            "subtotal",
            "tax_total",
            "discount_total",
            "grand_total",
            "paid_total",
            "balance_due",
            "status",
            "etims_status",
            "fiscal_payload",
            "synced_at",
            "payments",
            "created_at",
        ]
        read_only_fields = ["invoice_number", "paid_total", "balance_due", "status", "created_at"]


class GuestVisitSerializer(serializers.ModelSerializer):
    orders = SalesOrderSerializer(many=True, read_only=True)
    service_point_name = serializers.CharField(source="service_point.name", read_only=True)
    total_due = serializers.SerializerMethodField()

    class Meta:
        model = GuestVisit
        fields = [
            "waiter_keycloak_sub",
            "id",
            "visit_number",
            "public_token",
            "service_point",
            "service_point_name",
            "service_area",
            "table_name",
            "guest_name",
            "phone",
            "status",
            "waiter_requested_at",
            "waiter_acknowledged_at",
            "checkout_requested_at",
            "feedback_rating",
            "feedback_comment",
            "arrived_at",
            "closed_at",
            "updated_at",
            "total_due",
            "orders",
        ]
        read_only_fields = fields

    def get_total_due(self, obj):
        return sum(
            (order.invoice.balance_due for order in obj.orders.all() if hasattr(order, "invoice")),
            Decimal("0"),
        )


class CustomerPaymentRunSerializer(serializers.ModelSerializer):
    allocation_count = serializers.IntegerField(source="allocations.count", read_only=True)

    class Meta:
        model = CustomerPaymentRun
        fields = [
            "id",
            "run_number",
            "customer_name",
            "amount",
            "unapplied_amount",
            "status",
            "notes",
            "allocation_count",
            "created_at",
            "applied_at",
        ]
        read_only_fields = ["run_number", "unapplied_amount", "status", "created_at", "applied_at"]
