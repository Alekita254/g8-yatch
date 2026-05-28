from django.urls import path

from .views import FolioCheckoutView, FolioLineCreateView, FolioListCreateView

urlpatterns = [
    path("", FolioListCreateView.as_view(), name="folios"),
    path("<int:pk>/lines/", FolioLineCreateView.as_view(), name="folio-lines"),
    path("<int:pk>/checkout/", FolioCheckoutView.as_view(), name="folio-checkout"),
]
