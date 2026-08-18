from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import DiscountRule, TaxCategory, TaxConfiguration, TaxOffice
from .serializers import (
    DiscountRuleSerializer,
    TaxCategorySerializer,
    TaxConfigurationSerializer,
    TaxOfficeSerializer,
)


class TaxConfigurationListCreateView(ListCreateAPIView):
    model = TaxConfiguration
    serializer_class = TaxConfigurationSerializer


class TaxConfigurationDetailView(DetailAPIView):
    model = TaxConfiguration
    serializer_class = TaxConfigurationSerializer


class TaxCategoryListCreateView(ListCreateAPIView):
    model = TaxCategory
    serializer_class = TaxCategorySerializer

    def get_queryset(self):
        return TaxCategory.objects.prefetch_related("taxes")


class TaxCategoryDetailView(DetailAPIView):
    model = TaxCategory
    serializer_class = TaxCategorySerializer


class TaxOfficeListCreateView(ListCreateAPIView):
    model = TaxOffice
    serializer_class = TaxOfficeSerializer


class TaxOfficeDetailView(DetailAPIView):
    model = TaxOffice
    serializer_class = TaxOfficeSerializer


class DiscountRuleListCreateView(ListCreateAPIView):
    model = DiscountRule
    serializer_class = DiscountRuleSerializer


class DiscountRuleDetailView(DetailAPIView):
    model = DiscountRule
    serializer_class = DiscountRuleSerializer
