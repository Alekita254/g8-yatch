from django.urls import path

from .views import (
    BranchDetailView,
    BranchListCreateView,
    OrganizationDetailView,
    OrganizationListCreateView,
)

urlpatterns = [
    path("organizations/", OrganizationListCreateView.as_view(), name="organizations"),
    path("organizations/<int:pk>/", OrganizationDetailView.as_view(), name="organization-detail"),
    path("branches/", BranchListCreateView.as_view(), name="branches"),
    path("branches/<int:pk>/", BranchDetailView.as_view(), name="branch-detail"),
]
