"""Ticketing and service-request API views for concierge workflows."""

from django.utils import timezone

from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import ServiceRequest
from .serializers import ServiceRequestSerializer


def next_ticket_number():
    """Generate the next concierge service request ticket number."""

    return f"SR-{timezone.now():%Y%m%d}-{ServiceRequest.objects.count() + 1:05d}"


class ServiceRequestListCreateView(ListCreateAPIView):
    """List service requests and create new concierge tickets."""

    model = ServiceRequest
    serializer_class = ServiceRequestSerializer

    def get_queryset(self):
        """Include related room and guest entities in list responses."""
        return ServiceRequest.objects.select_related("room", "business_partner")

    def perform_create(self, serializer):
        """Assign an auto-generated ticket number when creating a request."""
        return serializer.save(ticket_number=next_ticket_number())


class ServiceRequestDetailView(DetailAPIView):
    """Retrieve, update, or delete an individual service request."""

    model = ServiceRequest
    serializer_class = ServiceRequestSerializer
