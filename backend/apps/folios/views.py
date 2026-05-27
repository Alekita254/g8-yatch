from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager

from .models import Folio
from .serializers import FolioSerializer


def next_folio_number():
    return f"FOL-{timezone.now():%Y%m%d}-{Folio.objects.count() + 1:05d}"


class FolioListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        queryset = Folio.objects.select_related("reservation", "business_partner", "room").prefetch_related("lines")
        return Response({"total": queryset.count(), "results": FolioSerializer(queryset, many=True).data})

    def post(self, request):
        data = request.data.copy()
        data["folio_number"] = next_folio_number()
        serializer = FolioSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        folio = serializer.save(folio_number=data["folio_number"])
        return Response(FolioSerializer(folio).data, status=status.HTTP_201_CREATED)


class FolioCheckoutView(APIView):
    permission_classes = [IsPosManager]

    def post(self, request, pk):
        folio = get_object_or_404(Folio, pk=pk)
        if folio.balance_due > 0:
            return Response({"detail": "Cannot checkout while folio balance is greater than zero."}, status=status.HTTP_400_BAD_REQUEST)
        folio.status = Folio.Status.CLOSED
        folio.closed_at = timezone.now()
        folio.save(update_fields=["status", "closed_at"])
        return Response(FolioSerializer(folio).data)
