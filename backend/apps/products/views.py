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
    model = ProductCategory
    serializer_class = ProductCategorySerializer


class ProductCategoryDetailView(RetrieveUpdateDestroyAPIView):
    model = ProductCategory
    serializer_class = ProductCategorySerializer


class ProductListCreateView(ListCreateAPIView):
    model = Product
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.select_related("category", "inventory_threshold")


class ProductDetailView(RetrieveUpdateDestroyAPIView):
    model = Product
    serializer_class = ProductSerializer


class SalesPricelistListCreateView(ListCreateAPIView):
    model = SalesPricelist
    serializer_class = SalesPricelistSerializer

    def get_queryset(self):
        return SalesPricelist.objects.select_related("service_point").prefetch_related(
            Prefetch("items", queryset=SalesPricelistItem.objects.select_related("product", "product__category")),
            "service_points",
        )


class SalesPricelistDetailView(RetrieveUpdateDestroyAPIView):
    model = SalesPricelist
    serializer_class = SalesPricelistSerializer


class PurchasePricelistListCreateView(ListCreateAPIView):
    model = PurchasePricelist
    serializer_class = PurchasePricelistSerializer


class PurchasePricelistDetailView(RetrieveUpdateDestroyAPIView):
    model = PurchasePricelist
    serializer_class = PurchasePricelistSerializer
