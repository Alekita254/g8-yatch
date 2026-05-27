from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager

from .models import BusinessPartner
from .serializers import BusinessPartnerSerializer


class BusinessPartnerListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        queryset = BusinessPartner.objects.all()
        serializer = BusinessPartnerSerializer(queryset, many=True)
        return Response({"total": queryset.count(), "results": serializer.data})

    def post(self, request):
        serializer = BusinessPartnerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        partner = serializer.save()
        return Response(BusinessPartnerSerializer(partner).data, status=status.HTTP_201_CREATED)


class BusinessPartnerDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, pk):
        partner = get_object_or_404(BusinessPartner, pk=pk)
        serializer = BusinessPartnerSerializer(partner, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        partner = serializer.save()
        return Response(BusinessPartnerSerializer(partner).data)
