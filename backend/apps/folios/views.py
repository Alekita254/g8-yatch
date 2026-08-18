from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response

from apps.common.views import BaseAPIView, ListCreateAPIView
from .models import Folio, FolioLine
from .serializers import FolioLineSerializer, FolioSerializer


def next_folio_number():
    return f"FOL-{timezone.now():%Y%m%d}-{Folio.objects.count() + 1:05d}"


class FolioListCreateView(ListCreateAPIView):
    model = Folio
    serializer_class = FolioSerializer

    def get_queryset(self):
        return Folio.objects.select_related(
            "reservation", "business_partner", "room"
        ).prefetch_related("lines")

    def perform_create(self, serializer):
        return serializer.save(folio_number=next_folio_number())


class FolioCheckoutView(BaseAPIView):
    def post(self, request, pk):
        folio = get_object_or_404(Folio, pk=pk)
        if folio.balance_due > 0:
            return Response(
                {"detail": "Cannot checkout while folio balance is greater than zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        folio.status = Folio.Status.CLOSED
        folio.closed_at = timezone.now()
        folio.save(update_fields=["status", "closed_at"])
        return Response(FolioSerializer(folio).data)


class FolioLineCreateView(BaseAPIView):
    def post(self, request, pk):
        folio = get_object_or_404(Folio, pk=pk)
        if folio.status != Folio.Status.OPEN:
            return Response(
                {"detail": "Only open folios can receive new lines."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = FolioLineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        line = serializer.save(folio=folio)

        if line.line_type == FolioLine.LineType.PAYMENT:
            folio.payment_total += line.amount
        else:
            folio.charge_total += line.amount
        folio.balance_due = folio.charge_total - folio.payment_total
        folio.save(update_fields=["charge_total", "payment_total", "balance_due"])

        return Response(FolioLineSerializer(line).data, status=status.HTTP_201_CREATED)
