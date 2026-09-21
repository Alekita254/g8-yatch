"""Catalog and price-list CRUD views for products and related pricing entities."""

from django.db.models import Prefetch

from apps.common.views import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import (
    Product,
    ProductCategory,
    PurchasePricelist,
    SalesPricelist,
    SalesPricelistItem,
)
from .serializers import (
    ProductCategorySerializer,
    ProductSerializer,
    PurchasePricelistSerializer,
    SalesPricelistSerializer,
)


class ProductCategoryListCreateView(ListCreateAPIView):
    """List and create product categories."""

    model = ProductCategory
    serializer_class = ProductCategorySerializer


class ProductCategoryDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a product category."""

    model = ProductCategory
    serializer_class = ProductCategorySerializer


class ProductListCreateView(ListCreateAPIView):
    """List and create products with linked category and threshold details."""

    model = Product
    serializer_class = ProductSerializer

    def get_queryset(self):
        """Eager-load related category and inventory threshold references."""
        return Product.objects.select_related("category", "inventory_threshold")


class ProductDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a product."""

    model = Product
    serializer_class = ProductSerializer


class SalesPricelistListCreateView(ListCreateAPIView):
    """List and create sales price lists for service points."""

    model = SalesPricelist
    serializer_class = SalesPricelistSerializer

    def get_queryset(self):
        """Load sales price lists with items and related products in one query."""
        return SalesPricelist.objects.select_related("service_point").prefetch_related(
            Prefetch("items", queryset=SalesPricelistItem.objects.select_related("product", "product__category")),
            "service_points",
        )


class SalesPricelistDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a sales price list."""

    model = SalesPricelist
    serializer_class = SalesPricelistSerializer


class PurchasePricelistListCreateView(ListCreateAPIView):
    """List and create supplier purchase price lists."""

    model = PurchasePricelist
    serializer_class = PurchasePricelistSerializer


class PurchasePricelistDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a purchase price list."""

    model = PurchasePricelist
    serializer_class = PurchasePricelistSerializer
