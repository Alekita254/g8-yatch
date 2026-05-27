from django.urls import path

from .views import ServiceRequestDetailView, ServiceRequestListCreateView

urlpatterns = [
    path("requests/", ServiceRequestListCreateView.as_view(), name="service-requests"),
    path("requests/<int:pk>/", ServiceRequestDetailView.as_view(), name="service-request-detail"),
]
