from django.urls import path

from .views import ReservationDetailView, ReservationListCreateView

urlpatterns = [
    path("", ReservationListCreateView.as_view(), name="reservations"),
    path("<int:pk>/", ReservationDetailView.as_view(), name="reservation-detail"),
]
