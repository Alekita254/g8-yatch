"""Tax configuration and rule management CRUD API views."""

from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import DiscountRule, TaxCategory, TaxConfiguration, TaxOffice
from .serializers import (
    DiscountRuleSerializer,
    TaxCategorySerializer,
    TaxConfigurationSerializer,
    TaxOfficeSerializer,
)


class TaxConfigurationListCreateView(ListCreateAPIView):
    """List and create tax configuration entries."""

    model = TaxConfiguration
    serializer_class = TaxConfigurationSerializer


class TaxConfigurationDetailView(DetailAPIView):
    """Retrieve, update, or delete an individual tax configuration."""

    model = TaxConfiguration
    serializer_class = TaxConfigurationSerializer


class TaxCategoryListCreateView(ListCreateAPIView):
    """List and create tax categories with linked tax entries."""

    model = TaxCategory
    serializer_class = TaxCategorySerializer

    def get_queryset(self):
        """Prefetch related taxes to reduce query count in list responses."""
        return TaxCategory.objects.prefetch_related("taxes")


class TaxCategoryDetailView(DetailAPIView):
    """Retrieve, update, or delete a tax category."""

    model = TaxCategory
    serializer_class = TaxCategorySerializer


class TaxOfficeListCreateView(ListCreateAPIView):
    """List and create tax office records."""

    model = TaxOffice
    serializer_class = TaxOfficeSerializer


class TaxOfficeDetailView(DetailAPIView):
    """Retrieve, update, or delete a tax office."""

    model = TaxOffice
    serializer_class = TaxOfficeSerializer


class DiscountRuleListCreateView(ListCreateAPIView):
    """List and create discount rules used by pricing and invoicing flows."""

    model = DiscountRule
    serializer_class = DiscountRuleSerializer


class DiscountRuleDetailView(DetailAPIView):
    """Retrieve, update, or delete a discount rule."""

    model = DiscountRule
    serializer_class = DiscountRuleSerializer
