from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager
from apps.pagination import paginated_response

from .models import Product, ProductCategory, PurchasePricelist, SalesPricelist
from .serializers import (
    ProductCategorySerializer,
    ProductSerializer,
    PurchasePricelistSerializer,
    SalesPricelistSerializer,
)


class ListCreateMixin(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def get_queryset(self):
        return self.model.objects.all()

    def get(self, request):
        queryset = self.get_queryset()
        return paginated_response(request, queryset, self.serializer_class)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.serializer_class(instance).data, status=status.HTTP_201_CREATED)


class DetailMixin(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def get(self, request, pk):
        instance = get_object_or_404(self.model, pk=pk)
        return Response(self.serializer_class(instance).data)

    def patch(self, request, pk):
        instance = get_object_or_404(self.model, pk=pk)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.serializer_class(instance).data)


class ProductCategoryListCreateView(ListCreateMixin):
    model = ProductCategory
    serializer_class = ProductCategorySerializer


class ProductCategoryDetailView(DetailMixin):
    model = ProductCategory
    serializer_class = ProductCategorySerializer


class ProductListCreateView(ListCreateMixin):
    model = Product
    serializer_class = ProductSerializer


class ProductDetailView(DetailMixin):
    model = Product
    serializer_class = ProductSerializer


class SalesPricelistListCreateView(ListCreateMixin):
    model = SalesPricelist
    serializer_class = SalesPricelistSerializer

    def get_queryset(self):
        return SalesPricelist.objects.select_related("service_point").prefetch_related("items", "service_points")


class SalesPricelistDetailView(DetailMixin):
    model = SalesPricelist
    serializer_class = SalesPricelistSerializer


class PurchasePricelistListCreateView(ListCreateMixin):
    model = PurchasePricelist
    serializer_class = PurchasePricelistSerializer


class PurchasePricelistDetailView(DetailMixin):
    model = PurchasePricelist
    serializer_class = PurchasePricelistSerializer
