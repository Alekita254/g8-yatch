from django.urls import path

from .views import RoomDetailView, RoomListCreateView, RoomTypeDetailView, RoomTypeListCreateView

urlpatterns = [
    path("types/", RoomTypeListCreateView.as_view(), name="room-types"),
    path("types/<int:pk>/", RoomTypeDetailView.as_view(), name="room-type-detail"),
    path("", RoomListCreateView.as_view(), name="rooms"),
    path("<int:pk>/", RoomDetailView.as_view(), name="room-detail"),
]
