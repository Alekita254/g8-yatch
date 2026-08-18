from django.utils import timezone

from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import Reservation
from .serializers import ReservationSerializer


def next_reservation_number():
    return f"RES-{timezone.now():%Y%m%d}-{Reservation.objects.count() + 1:05d}"


class ReservationListCreateView(ListCreateAPIView):
    model = Reservation
    serializer_class = ReservationSerializer

    def get_queryset(self):
        return Reservation.objects.select_related("business_partner", "room")

    def perform_create(self, serializer):
        return serializer.save(reservation_number=next_reservation_number())


class ReservationDetailView(DetailAPIView):
    model = Reservation
    serializer_class = ReservationSerializer
