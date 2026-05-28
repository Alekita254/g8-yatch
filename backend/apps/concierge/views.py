from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager
from apps.pagination import paginated_response

from .models import ServiceRequest
from .serializers import ServiceRequestSerializer


def next_ticket_number():
    return f"SR-{timezone.now():%Y%m%d}-{ServiceRequest.objects.count() + 1:05d}"


class ServiceRequestListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        queryset = ServiceRequest.objects.select_related("room", "business_partner")
        return paginated_response(request, queryset, ServiceRequestSerializer)

    def post(self, request):
        data = request.data.copy()
        data["ticket_number"] = next_ticket_number()
        serializer = ServiceRequestSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save(ticket_number=data["ticket_number"])
        return Response(ServiceRequestSerializer(ticket).data, status=status.HTTP_201_CREATED)


class ServiceRequestDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, pk):
        ticket = get_object_or_404(ServiceRequest, pk=pk)
        serializer = ServiceRequestSerializer(ticket, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        ticket = serializer.save()
        return Response(ServiceRequestSerializer(ticket).data)
