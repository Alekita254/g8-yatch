from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager

from .models import Room, RoomType
from .serializers import RoomSerializer, RoomTypeSerializer


class ListCreateView(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def get_queryset(self):
        return self.model.objects.all()

    def get(self, request):
        queryset = self.get_queryset()
        return Response({"total": queryset.count(), "results": self.serializer_class(queryset, many=True).data})

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(self.serializer_class(obj).data, status=status.HTTP_201_CREATED)


class DetailView(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def patch(self, request, pk):
        obj = get_object_or_404(self.model, pk=pk)
        serializer = self.serializer_class(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(self.serializer_class(obj).data)


class RoomTypeListCreateView(ListCreateView):
    model = RoomType
    serializer_class = RoomTypeSerializer


class RoomTypeDetailView(DetailView):
    model = RoomType
    serializer_class = RoomTypeSerializer


class RoomListCreateView(ListCreateView):
    model = Room
    serializer_class = RoomSerializer

    def get_queryset(self):
        return Room.objects.select_related("branch", "room_type")


class RoomDetailView(DetailView):
    model = Room
    serializer_class = RoomSerializer
