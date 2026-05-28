from rest_framework import serializers

from .models import (
    BillOfMaterialsItem,
    Product,
    ProductCategory,
    PurchasePricelist,
    PurchasePricelistItem,
    SalesPricelist,
    SalesPricelistItem,
)


class ProductCategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = ProductCategory
        fields = [
            "id",
            "name",
            "code",
            "parent",
            "parent_name",
            "tax_code",
            "tax_rate",
            "ui_tab",
            "route_printer_ip",
            "route_station",
            "is_active",
        ]


class BillOfMaterialsItemSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source="component.name", read_only=True)
    component_sku = serializers.CharField(source="component.sku", read_only=True)

    class Meta:
        model = BillOfMaterialsItem
        fields = ["id", "component", "component_name", "component_sku", "quantity", "unit"]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    product_type_display = serializers.CharField(source="get_product_type_display", read_only=True)
    bom_items = BillOfMaterialsItemSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "product_type",
            "product_type_display",
            "category",
            "category_name",
            "unit",
            "package_type",
            "pack_size",
            "quantity",
            "description",
            "is_sellable",
            "is_inventory_tracked",
            "is_active",
            "bom_items",
        ]

    def create(self, validated_data):
        bom_items = validated_data.pop("bom_items", [])
        product = Product.objects.create(**validated_data)
        for item in bom_items:
            BillOfMaterialsItem.objects.create(product=product, **item)
        return product

    def update(self, instance, validated_data):
        bom_items = validated_data.pop("bom_items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if bom_items is not None:
            instance.bom_items.all().delete()
            for item in bom_items:
                BillOfMaterialsItem.objects.create(product=instance, **item)

        return instance


class SalesPricelistItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = SalesPricelistItem
        fields = ["id", "product", "product_name", "product_sku", "price", "currency"]


class SalesPricelistSerializer(serializers.ModelSerializer):
    items = SalesPricelistItemSerializer(many=True, required=False)
    service_point_name = serializers.CharField(source="service_point.name", read_only=True)
    service_point_code = serializers.CharField(source="service_point.code", read_only=True)
    service_point_kind_display = serializers.CharField(source="service_point.get_kind_display", read_only=True)
    service_point_names = serializers.SerializerMethodField()

    class Meta:
        model = SalesPricelist
        fields = [
            "id",
            "name",
            "code",
            "description",
            "service_point",
            "service_point_name",
            "service_point_code",
            "service_point_kind",
            "service_point_kind_display",
            "service_points",
            "service_point_names",
            "valid_from",
            "valid_to",
            "is_active",
            "items",
        ]

    def create(self, validated_data):
        items = validated_data.pop("items", [])
        service_points = validated_data.pop("service_points", [])
        pricelist = SalesPricelist.objects.create(**validated_data)
        pricelist.service_points.set(service_points)
        for item in items:
            SalesPricelistItem.objects.create(pricelist=pricelist, **item)
        return pricelist

    def update(self, instance, validated_data):
        items = validated_data.pop("items", None)
        service_points = validated_data.pop("service_points", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if service_points is not None:
            instance.service_points.set(service_points)

        if items is not None:
            instance.items.all().delete()
            for item in items:
                SalesPricelistItem.objects.create(pricelist=instance, **item)

        return instance

    def get_service_point_names(self, obj):
        return [point.name for point in obj.service_points.all()]


class PurchasePricelistItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = PurchasePricelistItem
        fields = ["id", "product", "product_name", "product_sku", "price", "currency", "unit"]


class PurchasePricelistSerializer(serializers.ModelSerializer):
    items = PurchasePricelistItemSerializer(many=True, required=False)

    class Meta:
        model = PurchasePricelist
        fields = [
            "id",
            "supplier_name",
            "code",
            "description",
            "valid_from",
            "valid_to",
            "is_active",
            "items",
        ]

    def create(self, validated_data):
        items = validated_data.pop("items", [])
        pricelist = PurchasePricelist.objects.create(**validated_data)
        for item in items:
            PurchasePricelistItem.objects.create(pricelist=pricelist, **item)
        return pricelist

    def update(self, instance, validated_data):
        items = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items is not None:
            instance.items.all().delete()
            for item in items:
                PurchasePricelistItem.objects.create(pricelist=instance, **item)

        return instance
