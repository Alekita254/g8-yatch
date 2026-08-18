from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import Room, RoomType
from .serializers import RoomSerializer, RoomTypeSerializer


class RoomTypeListCreateView(ListCreateAPIView):
    model = RoomType
    serializer_class = RoomTypeSerializer


class RoomTypeDetailView(DetailAPIView):
    model = RoomType
    serializer_class = RoomTypeSerializer


class RoomListCreateView(ListCreateAPIView):
    model = Room
    serializer_class = RoomSerializer

    def get_queryset(self):
        return Room.objects.select_related("branch", "room_type")


class RoomDetailView(DetailAPIView):
    model = Room
    serializer_class = RoomSerializer
