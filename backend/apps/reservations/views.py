from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager

from .models import Reservation
from .serializers import ReservationSerializer


def next_reservation_number():
    return f"RES-{timezone.now():%Y%m%d}-{Reservation.objects.count() + 1:05d}"


class ReservationListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        queryset = Reservation.objects.select_related("business_partner", "room")
        return Response({"total": queryset.count(), "results": ReservationSerializer(queryset, many=True).data})

    def post(self, request):
        data = request.data.copy()
        data["reservation_number"] = next_reservation_number()
        serializer = ReservationSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.save(reservation_number=data["reservation_number"])
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


class ReservationDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, pk):
        reservation = get_object_or_404(Reservation, pk=pk)
        serializer = ReservationSerializer(reservation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        reservation = serializer.save()
        return Response(ReservationSerializer(reservation).data)
