from rest_framework import serializers

from .models import CustomerPaymentRun, SalesInvoice, SalesOrder, SalesOrderItem, SalesPayment


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

    class Meta:
        model = SalesOrder
        fields = [
            "id",
            "order_number",
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
