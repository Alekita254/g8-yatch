from django.urls import path

from .views import (
    AdminUserListCreateView,
    AdminUserRoleView,
    MeView,
    RoleDetailView,
    RoleListCreateView,
    ServicePointDetailView,
    ServicePointListCreateView,
)

urlpatterns = [
    path("me/", MeView.as_view(), name="users-me"),
    path("roles/", RoleListCreateView.as_view(), name="roles-list-create"),
    path("roles/<int:pk>/", RoleDetailView.as_view(), name="roles-detail"),
    path(
        "service-points/",
        ServicePointListCreateView.as_view(),
        name="service-points-list-create",
    ),
    path(
        "service-points/<int:pk>/",
        ServicePointDetailView.as_view(),
        name="service-points-detail",
    ),
    path("", AdminUserListCreateView.as_view(), name="users-admin-list-create"),
    path("<str:keycloak_sub>/roles/", AdminUserRoleView.as_view(), name="users-admin-roles"),
]
