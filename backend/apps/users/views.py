from rest_framework.response import Response
from rest_framework.views import APIView

from .keycloak_admin import KeycloakAdminClient, KeycloakAdminError
from .models import UserIdentity
from .permissions import IsPosManager
from .serializers import (
    AdminUserCreateSerializer,
    AdminUserRoleSerializer,
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
