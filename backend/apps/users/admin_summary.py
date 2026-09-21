"""Admin dashboard summary service for web and mobile clients."""

from django.db.models import Count, F, Q

from apps.inventory.models import InventoryDocument
from apps.organisation.models import Branch, Organization
from apps.payments.models import BankAccount, PaymentMethod, PaymentRoutingRule
from apps.products.models import Product, ProductCategory, PurchasePricelist, SalesPricelist
from apps.rooms.models import Room
from apps.taxes.models import DiscountRule, TaxCategory, TaxConfiguration, TaxOffice

from .models import Role, ServicePoint, UserIdentity


def count_block(model):
    """Return total and active counts without loading full datasets."""
    counts = model.objects.aggregate(
        total=Count("id"),
        active=Count("id", filter=Q(is_active=True)),
    )
    return {
        "total": counts["total"] or 0,
        "active": counts["active"] or 0,
    }


def document_block(document_type, status=None):
    """Return document count and latest previews for the requested filter."""
    queryset = InventoryDocument.objects.select_related("purchase_pricelist").filter(
        document_type=document_type,
    )
    if status:
        queryset = queryset.filter(status=status)

    return {
        "total": queryset.count(),
        "results": list(queryset.order_by("-created_at")[:4]),
    }


def build_admin_summary_payload():
    """Build a compact admin summary payload for dashboard clients."""
    low_stock_total = Product.objects.filter(
        is_active=True,
        is_inventory_tracked=True,
        inventory_threshold__is_active=True,
        quantity__lte=F("inventory_threshold__minimum_quantity"),
    ).count()

    return {
        "users": count_block(UserIdentity),
        "roles": count_block(Role),
        "servicePoints": count_block(ServicePoint),
        "products": count_block(Product),
        "categories": count_block(ProductCategory),
        "salesPricelists": count_block(SalesPricelist),
        "purchasePricelists": count_block(PurchasePricelist),
        "rooms": count_block(Room),
        "taxConfigurations": count_block(TaxConfiguration),
        "taxCategories": count_block(TaxCategory),
        "taxOffices": count_block(TaxOffice),
        "discounts": count_block(DiscountRule),
        "organizations": count_block(Organization),
        "branches": count_block(Branch),
        "paymentMethods": count_block(PaymentMethod),
        "bankAccounts": count_block(BankAccount),
        "paymentRoutingRules": count_block(PaymentRoutingRule),
        "inventoryLowStock": {"total": low_stock_total},
        "inventoryDraftRequests": document_block(
            InventoryDocument.DocumentType.PURCHASE_REQUEST,
            InventoryDocument.Status.DRAFT,
        ),
        "inventorySubmittedRequests": document_block(
            InventoryDocument.DocumentType.PURCHASE_REQUEST,
            InventoryDocument.Status.SUBMITTED,
        ),
        "inventoryRequisitions": document_block(InventoryDocument.DocumentType.REQUISITION),
    }
