from django.urls import path

from .views import FolioCheckoutView, FolioListCreateView

urlpatterns = [
    path("", FolioListCreateView.as_view(), name="folios"),
    path("<int:pk>/checkout/", FolioCheckoutView.as_view(), name="folio-checkout"),
]
