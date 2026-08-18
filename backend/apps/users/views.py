from django.db.models import ProtectedError, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.views import DetailAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from apps.pagination import paginated_response

from .keycloak_admin import KeycloakAdminClient, KeycloakAdminError
from .models import Role, ServicePoint, UserIdentity
from .permissions import IsPosManager
from .serializers import (
    AdminUserCreateSerializer,
    AdminUserPasswordResetSerializer,
    AdminUserRoleSerializer,
    AdminUserUpdateSerializer,
    RoleSerializer,
    ServicePointSerializer,
    UserIdentitySerializer,
)
from .utils import (
    calculate_company_sales_summary,
    calculate_user_sales_stats,
    get_user_by_identifier,
    get_user_sales_detail_payload,
    get_user_sales_summary_payload,
    get_user_sub_identifiers,
)


class MeView(APIView):
    def get(self, request):
        serializer = UserIdentitySerializer(request.user.identity)
        roles = request.user.realm_roles
        role_keys = set(roles)
        role_keys.update(role.upper() for role in roles)
        permissions = sorted(
            {
                permission
                for role in Role.objects.filter(key__in=role_keys, is_active=True)
                for permission in (role.permissions or [])
            }
        )
        return Response(
            {
                "identity": serializer.data,
                "roles": roles,
                "permissions": permissions,
            }
        )


class AdminUserListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        users = UserIdentity.objects.all()
        return paginated_response(request, users, UserIdentitySerializer)

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


class AdminUserDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, keycloak_sub):
        identity = get_object_or_404(UserIdentity, keycloak_sub=keycloak_sub)
        serializer = AdminUserUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            KeycloakAdminClient().update_user(
                keycloak_sub,
                email=data.get("email", identity.email),
                first_name=data.get("first_name", identity.first_name),
                last_name=data.get("last_name", identity.last_name),
                enabled=data.get("is_active", identity.is_active),
            )
        except KeycloakAdminError as exc:
            return Response({"detail": str(exc)}, status=400)

        update_fields = ["updated_at"]
        for field in ("email", "first_name", "last_name", "is_active"):
            if field in data:
                setattr(identity, field, data[field])
                update_fields.append(field)
        identity.save(update_fields=update_fields)
        return Response(UserIdentitySerializer(identity).data)


class AdminUserPasswordResetView(APIView):
    permission_classes = [IsPosManager]

    def post(self, request, keycloak_sub):
        serializer = AdminUserPasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            KeycloakAdminClient().set_password(
                keycloak_sub,
                data["password"],
                temporary=data["temporary"],
            )
        except KeycloakAdminError as exc:
            return Response({"detail": str(exc)}, status=400)

        return Response({"detail": "Password reset successfully."})


class RoleListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        roles = Role.objects.all()
        return paginated_response(request, roles, RoleSerializer)

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


class ServicePointListCreateView(ListCreateAPIView):
    model = ServicePoint
    serializer_class = ServicePointSerializer


class ServicePointDetailView(RetrieveUpdateDestroyAPIView):
    model = ServicePoint
    serializer_class = ServicePointSerializer


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


class StaffSalesSummaryView(APIView):
    """Overview and performance summary for employees and company sales."""
    permission_classes = [IsPosManager]

    def get(self, request):
        user_id = request.query_params.get("user_id") or request.query_params.get("keycloak_sub")
        if user_id:
            user = get_user_by_identifier(user_id)
            return Response(get_user_sales_summary_payload(user))

        search = request.query_params.get("search", "").strip().lower()
        role_filter = request.query_params.get("role", "").strip()

        users_qs = UserIdentity.objects.all()
        if search:
            users_qs = users_qs.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )

        if role_filter:
            users_qs = [u for u in users_qs if role_filter in (u.realm_roles or [])]

        users_list = [get_user_sales_summary_payload(user) for user in users_qs]

        sort_by = request.query_params.get("sort_by", "month").lower()
        sort_field = self._get_sort_period_key(sort_by)
        users_list.sort(
            key=lambda u: (
                u.get(sort_field, {}).get("total_sales", 0),
                u.get(sort_field, {}).get("order_count", 0),
            ),
            reverse=True,
        )

        return Response({
            "results": users_list,
            "count": len(users_list),
            "company_summary": calculate_company_sales_summary(),
        })

    @staticmethod
    def _get_sort_period_key(sort_by: str) -> str:
        sort_map = {
            "today": "today",
            "week": "this_week",
            "this_week": "this_week",
            "all_time": "all_time",
        }
        return sort_map.get(sort_by, "this_month")


class StaffMemberSalesDetailView(APIView):
    """Detailed employee sales performance view with daily/weekly/monthly orders & breakdowns."""
    permission_classes = [IsPosManager]

    def get(self, request, keycloak_sub=None, user_id=None):
        identifier = keycloak_sub or user_id or request.query_params.get("user_id")
        user = get_user_by_identifier(identifier)

        payload = get_user_sales_detail_payload(
            user=user,
            period=request.query_params.get("period", "today"),
            start_str=request.query_params.get("start_date"),
            end_str=request.query_params.get("end_date"),
        )
        return Response(payload)


