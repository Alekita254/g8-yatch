from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager
from apps.pagination import paginated_response

from .models import DiscountRule, TaxCategory, TaxConfiguration, TaxOffice
from .serializers import (
    DiscountRuleSerializer,
    TaxCategorySerializer,
    TaxConfigurationSerializer,
    TaxOfficeSerializer,
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

    def patch(self, request, pk):
        instance = get_object_or_404(self.model, pk=pk)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.serializer_class(instance).data)


class TaxConfigurationListCreateView(ListCreateMixin):
    model = TaxConfiguration
    serializer_class = TaxConfigurationSerializer


class TaxConfigurationDetailView(DetailMixin):
    model = TaxConfiguration
    serializer_class = TaxConfigurationSerializer


class TaxCategoryListCreateView(ListCreateMixin):
    model = TaxCategory
    serializer_class = TaxCategorySerializer

    def get_queryset(self):
        return TaxCategory.objects.prefetch_related("taxes")


class TaxCategoryDetailView(DetailMixin):
    model = TaxCategory
    serializer_class = TaxCategorySerializer


class TaxOfficeListCreateView(ListCreateMixin):
    model = TaxOffice
    serializer_class = TaxOfficeSerializer


class TaxOfficeDetailView(DetailMixin):
    model = TaxOffice
    serializer_class = TaxOfficeSerializer


class DiscountRuleListCreateView(ListCreateMixin):
    model = DiscountRule
    serializer_class = DiscountRuleSerializer


class DiscountRuleDetailView(DetailMixin):
    model = DiscountRule
    serializer_class = DiscountRuleSerializer
