from django.urls import path

from .views import AdminUserListCreateView, AdminUserRoleView, MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="users-me"),
    path("", AdminUserListCreateView.as_view(), name="users-admin-list-create"),
    path("<str:keycloak_sub>/roles/", AdminUserRoleView.as_view(), name="users-admin-roles"),
]
