from django.db import transaction
from rest_framework import serializers

from apps.products.models import Product
from apps.products.serializers import ProductSerializer

from .models import InventoryDocument, InventoryDocumentLine, InventoryThreshold, StockMovement


class InventoryThresholdSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_unit = serializers.CharField(source="product.unit", read_only=True)
    current_quantity = serializers.DecimalField(source="product.quantity", max_digits=14, decimal_places=3, read_only=True)
    is_low_stock = serializers.SerializerMethodField()

    class Meta:
        model = InventoryThreshold
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "product_unit",
            "current_quantity",
            "minimum_quantity",
            "reorder_quantity",
            "is_active",
            "is_low_stock",
        ]

    def get_is_low_stock(self, obj):
        return obj.is_active and obj.product.quantity <= obj.minimum_quantity

    def create(self, validated_data):
        return InventoryThreshold.objects.update_or_create(
            product=validated_data["product"],
            defaults={
                "minimum_quantity": validated_data.get("minimum_quantity", 0),
                "reorder_quantity": validated_data.get("reorder_quantity", 0),
                "is_active": validated_data.get("is_active", True),
            },
        )[0]


class InventoryDocumentLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_unit = serializers.CharField(source="product.unit", read_only=True)
    current_quantity = serializers.DecimalField(source="product.quantity", max_digits=14, decimal_places=3, read_only=True)

    class Meta:
        model = InventoryDocumentLine
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "product_unit",
            "current_quantity",
            "requested_quantity",
            "received_quantity",
            "unit_cost",
            "notes",
        ]


class InventoryDocumentSerializer(serializers.ModelSerializer):
    lines = InventoryDocumentLineSerializer(many=True)
    document_type_display = serializers.CharField(source="get_document_type_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    purchase_pricelist_supplier = serializers.CharField(source="purchase_pricelist.supplier_name", read_only=True)
    purchase_pricelist_code = serializers.CharField(source="purchase_pricelist.code", read_only=True)
    source_document_number = serializers.CharField(source="source_document.document_number", read_only=True)

    class Meta:
        model = InventoryDocument
        fields = [
            "id",
            "document_number",
            "document_type",
            "document_type_display",
            "status",
            "status_display",
            "supplier_name",
            "purchase_pricelist",
            "purchase_pricelist_supplier",
            "purchase_pricelist_code",
            "source_document",
            "source_document_number",
            "notes",
            "approved_at",
            "received_at",
            "created_at",
            "updated_at",
            "lines",
        ]
        read_only_fields = ["document_number", "approved_at", "received_at", "created_at", "updated_at"]

    def validate_lines(self, lines):
        if not lines:
            raise serializers.ValidationError("Add at least one inventory item.")
        for line in lines:
            if line["requested_quantity"] <= 0:
                raise serializers.ValidationError("Requested quantity must be greater than zero.")
        return lines

    @transaction.atomic
    def create(self, validated_data):
        lines = validated_data.pop("lines", [])
        document = InventoryDocument.objects.create(**validated_data)
        for line in lines:
            InventoryDocumentLine.objects.create(document=document, **line)
        return document

    @transaction.atomic
    def update(self, instance, validated_data):
        lines = validated_data.pop("lines", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if lines is not None:
            instance.lines.all().delete()
            for line in lines:
                InventoryDocumentLine.objects.create(document=instance, **line)
        return instance


class LowStockProductSerializer(ProductSerializer):
    inventory_threshold = InventoryThresholdSerializer(read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ["inventory_threshold"]


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    document_number = serializers.CharField(source="document.document_number", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "document",
            "document_number",
            "movement_type",
            "quantity",
            "notes",
            "created_at",
        ]
