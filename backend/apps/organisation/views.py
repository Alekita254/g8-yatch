from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager

from .models import Branch, Organization
from .serializers import BranchSerializer, OrganizationSerializer


class ListCreateMixin(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def get_queryset(self):
        return self.model.objects.all()

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response({"total": queryset.count(), "results": serializer.data})

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.serializer_class(instance).data, status=status.HTTP_201_CREATED)


class DetailMixin(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def patch(self, request, pk):
        instance = get_object_or_404(self.model, pk=pk)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.serializer_class(instance).data)


class OrganizationListCreateView(ListCreateMixin):
    model = Organization
    serializer_class = OrganizationSerializer


class OrganizationDetailView(DetailMixin):
    model = Organization
    serializer_class = OrganizationSerializer


class BranchListCreateView(ListCreateMixin):
    model = Branch
    serializer_class = BranchSerializer

    def get_queryset(self):
        return Branch.objects.select_related("organization")


class BranchDetailView(DetailMixin):
    model = Branch
    serializer_class = BranchSerializer
