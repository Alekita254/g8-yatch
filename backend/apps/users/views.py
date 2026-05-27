from rest_framework.response import Response
from rest_framework.views import APIView

from .keycloak_admin import KeycloakAdminClient, KeycloakAdminError
from django.shortcuts import get_object_or_404
from rest_framework import status

from .models import Role, ServicePoint, UserIdentity
from .permissions import IsPosManager
from .serializers import (
    AdminUserCreateSerializer,
    AdminUserRoleSerializer,
    RoleSerializer,
    ServicePointSerializer,
    UserIdentitySerializer,
)


class MeView(APIView):
    def get(self, request):
        serializer = UserIdentitySerializer(request.user.identity)
        return Response(
            {
                "identity": serializer.data,
                "roles": request.user.realm_roles,
            }
        )


class AdminUserListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        users = UserIdentity.objects.all()
        serializer = UserIdentitySerializer(users, many=True)
        return Response(
            {
                "total": users.count(),
                "results": serializer.data,
            }
        )

    def post(self, request):
        serializer = AdminUserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        roles = data.get("realm_roles", [])

        try:
            keycloak_user = KeycloakAdminClient().create_user(
                username=data["username"],
                email=data["email"],
                first_name=data.get("first_name", ""),
                last_name=data.get("last_name", ""),
                password=data["password"],
            )
            if roles:
                KeycloakAdminClient().replace_realm_roles(keycloak_user["id"], roles)
        except KeycloakAdminError as exc:
            return Response({"detail": str(exc)}, status=400)

        identity, _ = UserIdentity.objects.update_or_create(
            keycloak_sub=keycloak_user["id"],
            defaults={
                "email": data["email"],
                "username": data["username"],
                "first_name": data.get("first_name", ""),
                "last_name": data.get("last_name", ""),
                "realm_roles": roles,
                "is_active": True,
            },
        )
        return Response(UserIdentitySerializer(identity).data, status=201)


class AdminUserRoleView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, keycloak_sub):
        serializer = AdminUserRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        roles = serializer.validated_data["realm_roles"]

        try:
            KeycloakAdminClient().replace_realm_roles(keycloak_sub, roles)
        except KeycloakAdminError as exc:
            return Response({"detail": str(exc)}, status=400)

        identity = UserIdentity.objects.get(keycloak_sub=keycloak_sub)
        identity.realm_roles = roles
        identity.save(update_fields=["realm_roles", "updated_at"])
        return Response(UserIdentitySerializer(identity).data)


class RoleListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response({"total": roles.count(), "results": serializer.data})

    def post(self, request):
        serializer = RoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()

        if role.sync_to_keycloak:
            try:
                KeycloakAdminClient().create_realm_role(role.key, role.description)
            except KeycloakAdminError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(RoleSerializer(role).data, status=status.HTTP_201_CREATED)


class RoleDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, pk):
        role = get_object_or_404(Role, pk=pk)
        serializer = RoleSerializer(role, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        role = serializer.save()

        if role.sync_to_keycloak:
            try:
                KeycloakAdminClient().create_realm_role(role.key, role.description)
            except KeycloakAdminError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(RoleSerializer(role).data)


class ServicePointListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        service_points = ServicePoint.objects.all()
        serializer = ServicePointSerializer(service_points, many=True)
        return Response({"total": service_points.count(), "results": serializer.data})

    def post(self, request):
        serializer = ServicePointSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service_point = serializer.save()
        return Response(
            ServicePointSerializer(service_point).data,
            status=status.HTTP_201_CREATED,
        )


class ServicePointDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, pk):
        service_point = get_object_or_404(ServicePoint, pk=pk)
        serializer = ServicePointSerializer(service_point, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        service_point = serializer.save()
        return Response(ServicePointSerializer(service_point).data)


class MyTokenObtainPairView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        return Response(
            {
                "detail": (
                    "Password login is disabled. Authenticate with Keycloak "
                    "and send the access token as a Bearer token."
                )
            },
            status=405,
        )
