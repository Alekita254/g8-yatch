"""Room and room-type CRUD API views for hospitality inventory."""

from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import Room, RoomType
from .serializers import RoomSerializer, RoomTypeSerializer


class RoomTypeListCreateView(ListCreateAPIView):
    """List and create room types."""

    model = RoomType
    serializer_class = RoomTypeSerializer


class RoomTypeDetailView(DetailAPIView):
    """Retrieve, update, or delete a room type."""

    model = RoomType
    serializer_class = RoomTypeSerializer


class RoomListCreateView(ListCreateAPIView):
    """List and create rooms with related branch and type metadata."""

    model = Room
    serializer_class = RoomSerializer

    def get_queryset(self):
        """Optimize room list responses by eager-loading branch and room type."""
        return Room.objects.select_related("branch", "room_type")


class RoomDetailView(DetailAPIView):
    """Retrieve, update, or delete a room."""

    model = Room
    serializer_class = RoomSerializer
