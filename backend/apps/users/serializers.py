"""Serializer definitions for identities, roles, service points, and admin user actions."""

from rest_framework import serializers

from apps.inventory.models import InventoryDocument

from .models import Role, ServicePoint, UserIdentity


class RoleSerializer(serializers.ModelSerializer):
    """Serialize role definitions and permission mappings."""

    class Meta:
        model = Role
        fields = [
            "id",
            "key",
            "name",
            "description",
            "permissions",
            "sync_to_keycloak",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ServicePointSerializer(serializers.ModelSerializer):
    """Serialize service point records used by operational workspaces."""

    kind_display = serializers.CharField(source="get_kind_display", read_only=True)

    class Meta:
        model = ServicePoint
        fields = [
            "id",
            "name",
            "code",
            "kind",
            "kind_display",
            "mac_address",
            "location",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "kind_display", "created_at", "updated_at"]


class UserIdentitySerializer(serializers.ModelSerializer):
    """Read-only serializer for synchronized Keycloak user identity data."""

    class Meta:
        model = UserIdentity
        fields = [
            "keycloak_sub",
            "email",
            "username",
            "first_name",
            "last_name",
            "realm_roles",
            "is_active",
            "last_seen_at",
        ]
        read_only_fields = fields


class AdminUserCreateSerializer(serializers.Serializer):
    """Validate payload for creating a new user in Keycloak."""

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(max_length=128, write_only=True)
    realm_roles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        required=False,
        default=list,
    )


class AdminUserRoleSerializer(serializers.Serializer):
    """Validate role replacement payload for an existing user."""

    realm_roles = serializers.ListField(
        child=serializers.CharField(max_length=80),
        allow_empty=True,
    )


class AdminUserUpdateSerializer(serializers.Serializer):
    """Validate optional profile updates for a managed user."""

    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)


class AdminUserPasswordResetSerializer(serializers.Serializer):
    """Validate admin-initiated password reset requests."""

    password = serializers.CharField(max_length=128, min_length=8, write_only=True)
    temporary = serializers.BooleanField(default=True)


class SummaryCountSerializer(serializers.Serializer):
    """Serialize total and active summary counters."""

    total = serializers.IntegerField()
    active = serializers.IntegerField()


class InventoryDocumentPreviewSerializer(serializers.ModelSerializer):
    """Serialize compact inventory document previews for dashboard cards."""

    document_type_display = serializers.CharField(source="get_document_type_display")
    status_display = serializers.CharField(source="get_status_display")
    purchase_pricelist_supplier = serializers.CharField(
        source="purchase_pricelist.supplier_name",
        default="",
    )

    class Meta:
        model = InventoryDocument
        fields = [
            "id",
            "document_number",
            "document_type",
            "document_type_display",
            "status",
            "status_display",
            "supplier_name",
            "purchase_pricelist_supplier",
            "created_at",
        ]


class InventoryDocumentSummarySerializer(serializers.Serializer):
    """Serialize inventory summary blocks with counts and latest documents."""

    total = serializers.IntegerField()
    results = InventoryDocumentPreviewSerializer(many=True)


class InventoryLowStockSummarySerializer(serializers.Serializer):
    """Serialize low-stock summary totals."""

    total = serializers.IntegerField()


class AdminSummarySerializer(serializers.Serializer):
    """Serialize consolidated admin dashboard summary payload."""

    users = SummaryCountSerializer()
    roles = SummaryCountSerializer()
    servicePoints = SummaryCountSerializer()
    products = SummaryCountSerializer()
    categories = SummaryCountSerializer()
    salesPricelists = SummaryCountSerializer()
    purchasePricelists = SummaryCountSerializer()
    rooms = SummaryCountSerializer()
    taxConfigurations = SummaryCountSerializer()
    taxCategories = SummaryCountSerializer()
    taxOffices = SummaryCountSerializer()
    discounts = SummaryCountSerializer()
    organizations = SummaryCountSerializer()
    branches = SummaryCountSerializer()
    paymentMethods = SummaryCountSerializer()
    bankAccounts = SummaryCountSerializer()
    paymentRoutingRules = SummaryCountSerializer()
    inventoryLowStock = InventoryLowStockSummarySerializer()
    inventoryDraftRequests = InventoryDocumentSummarySerializer()
    inventorySubmittedRequests = InventoryDocumentSummarySerializer()
    inventoryRequisitions = InventoryDocumentSummarySerializer()
