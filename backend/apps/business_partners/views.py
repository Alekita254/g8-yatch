"""CRUD API views for business partner records used across operations."""

from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import BusinessPartner
from .serializers import BusinessPartnerSerializer


class BusinessPartnerListCreateView(ListCreateAPIView):
    """List and create business partners such as guests, suppliers, and corporates."""

    model = BusinessPartner
    serializer_class = BusinessPartnerSerializer


class BusinessPartnerDetailView(DetailAPIView):
    """Retrieve, update, or delete a specific business partner."""

    model = BusinessPartner
    serializer_class = BusinessPartnerSerializer
