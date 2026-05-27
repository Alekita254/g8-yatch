from django.urls import path

from .views import BusinessPartnerDetailView, BusinessPartnerListCreateView

urlpatterns = [
    path("", BusinessPartnerListCreateView.as_view(), name="business-partners"),
    path("<int:pk>/", BusinessPartnerDetailView.as_view(), name="business-partner-detail"),
]
