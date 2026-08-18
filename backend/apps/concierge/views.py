from django.utils import timezone

from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import ServiceRequest
from .serializers import ServiceRequestSerializer


def next_ticket_number():
    return f"SR-{timezone.now():%Y%m%d}-{ServiceRequest.objects.count() + 1:05d}"


class ServiceRequestListCreateView(ListCreateAPIView):
    model = ServiceRequest
    serializer_class = ServiceRequestSerializer

    def get_queryset(self):
        return ServiceRequest.objects.select_related("room", "business_partner")

    def perform_create(self, serializer):
        return serializer.save(ticket_number=next_ticket_number())


class ServiceRequestDetailView(DetailAPIView):
    model = ServiceRequest
    serializer_class = ServiceRequestSerializer
