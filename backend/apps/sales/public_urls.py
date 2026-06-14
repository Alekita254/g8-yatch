from django.urls import path

from .public_views import (
    PublicMenuView,
    PublicVisitCheckoutView,
    PublicVisitDetailView,
    PublicVisitFeedbackView,
    PublicVisitOrderView,
    PublicVisitStartView,
    PublicVisitWaiterView,
)

urlpatterns = [
    path("menu/", PublicMenuView.as_view(), name="public-menu"),
    path("visits/", PublicVisitStartView.as_view(), name="public-visit-start"),
    path("visits/<uuid:token>/", PublicVisitDetailView.as_view(), name="public-visit-detail"),
    path("visits/<uuid:token>/orders/", PublicVisitOrderView.as_view(), name="public-visit-order"),
    path("visits/<uuid:token>/waiter/", PublicVisitWaiterView.as_view(), name="public-visit-waiter"),
    path("visits/<uuid:token>/checkout/", PublicVisitCheckoutView.as_view(), name="public-visit-checkout"),
    path("visits/<uuid:token>/feedback/", PublicVisitFeedbackView.as_view(), name="public-visit-feedback"),
]
