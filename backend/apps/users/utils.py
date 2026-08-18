from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

from django.db.models import Count, Q, QuerySet, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.sales.models import SalesInvoice, SalesOrder, SalesOrderItem, SalesPayment
from .models import UserIdentity


def get_user_sub_identifiers(user: UserIdentity) -> List[str]:
    """
    Extract all known candidate identity values for a staff member.
    Single Responsibility: Resolve user alias identifiers.
    """
    candidates = [user.keycloak_sub]
    if user.username:
        candidates.append(user.username)
    if user.email:
        candidates.append(user.email)
    return list(dict.fromkeys([c for c in candidates if c]))


def get_user_display_name(user: UserIdentity) -> str:
    """
    Produce a clean, formatted display name for a user.
    Single Responsibility: Name formatting.
    """
    full_name = " ".join(
        part.strip() for part in (user.first_name, user.last_name) if part.strip()
    )
    return full_name or user.username or user.email or user.keycloak_sub


def get_user_by_identifier(identifier: str) -> UserIdentity:
    """
    Retrieve a UserIdentity by database ID, Keycloak SUB, username, or email.
    Single Responsibility: Single-user lookup by generic identifier.
    """
    if str(identifier).isdigit():
        user = UserIdentity.objects.filter(id=int(identifier)).first()
        if user:
            return user

    return get_object_or_404(
        UserIdentity,
        Q(keycloak_sub=identifier) | Q(username=identifier) | Q(email=identifier),
    )


def parse_date_range_bounds(
    period: str = "today",
    start_str: Optional[str] = None,
    end_str: Optional[str] = None,
    now: Optional[datetime] = None,
) -> Tuple[Optional[datetime], Optional[datetime]]:
    """
    Determine start and end timestamps for a given period name or custom range.
    Single Responsibility: Calculate date window bounds.
    """
    if now is None:
        now = timezone.now()

    period = (period or "today").lower().strip()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    if period == "today":
        return start_of_today, now
    elif period in ("this_week", "week"):
        return start_of_week, now
    elif period in ("this_month", "month"):
        return start_of_month, now
    elif period in ("all_time", "all"):
        return None, now
    elif period == "custom":
        date_start = _parse_iso_datetime(start_str, default=start_of_today)
        date_end = _parse_iso_datetime(end_str, default=now)
        return date_start, date_end

    return start_of_today, now


def _parse_iso_datetime(date_str: Optional[str], default: datetime) -> datetime:
    """Safely parse an ISO datetime string and ensure timezone awareness."""
    if not date_str:
        return default
    try:
        dt = datetime.fromisoformat(date_str)
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt)
        return dt
    except ValueError:
        return default


def get_user_orders_queryset(
    user: UserIdentity,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> QuerySet:
    """
    Build filtered QuerySet of sales orders for a specific user.
    Single Responsibility: Query user sales orders.
    """
    sub_values = get_user_sub_identifiers(user)
    qs = (
        SalesOrder.objects.filter(waiter_keycloak_sub__in=sub_values)
        .exclude(status=SalesOrder.Status.CANCELLED)
    )
    if start_date:
        qs = qs.filter(created_at__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__lte=end_date)
    return qs


def get_user_payments_queryset(
    user: UserIdentity,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> QuerySet:
    """
    Build filtered QuerySet of cleared payments received by a specific user.
    Single Responsibility: Query user sales payments.
    """
    sub_values = get_user_sub_identifiers(user)
    qs = SalesPayment.objects.filter(
        received_by__in=sub_values,
        status=SalesPayment.Status.CLEARED,
    )
    if start_date:
        qs = qs.filter(created_at__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__lte=end_date)
    return qs


def aggregate_sales_metrics(orders_qs: QuerySet, payments_qs: QuerySet) -> Dict[str, Any]:
    """
    Compute total sales, order count, payments received, and average order value.
    Single Responsibility: Aggregate financial metrics from given querysets.
    """
    agg = orders_qs.aggregate(
        total_sales=Sum("grand_total"),
        order_count=Count("id"),
        paid_total=Sum("invoice__paid_total", filter=Q(invoice__isnull=False)),
    )
    total_sales = agg["total_sales"] or Decimal("0.00")
    order_count = agg["order_count"] or 0
    paid_total = agg["paid_total"] or Decimal("0.00")
    balance_due = max(total_sales - paid_total, Decimal("0.00"))
    avg_order = (total_sales / order_count) if order_count > 0 else Decimal("0.00")

    pay_agg = payments_qs.aggregate(
        pay_total=Sum("amount"),
        pay_count=Count("id"),
    )
    payments_received = pay_agg["pay_total"] or Decimal("0.00")
    payments_count = pay_agg["pay_count"] or 0

    return {
        "total_sales": float(total_sales),
        "order_count": order_count,
        "paid_total": float(paid_total),
        "balance_due": float(balance_due),
        "avg_order_value": round(float(avg_order), 2),
        "payments_received": float(payments_received),
        "payments_count": payments_count,
    }


def calculate_user_sales_stats(user: UserIdentity, now: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Compute daily, weekly, monthly, and all-time sales metrics for a single employee.
    Single Responsibility: Aggregate user performance across standard time windows.
    """
    if now is None:
        now = timezone.now()

    start_of_today, _ = parse_date_range_bounds("today", now=now)
    start_of_week, _ = parse_date_range_bounds("week", now=now)
    start_of_month, _ = parse_date_range_bounds("month", now=now)

    orders_base = get_user_orders_queryset(user)
    payments_base = get_user_payments_queryset(user)

    today_orders = orders_base.filter(created_at__gte=start_of_today)
    today_payments = payments_base.filter(created_at__gte=start_of_today)

    week_orders = orders_base.filter(created_at__gte=start_of_week)
    week_payments = payments_base.filter(created_at__gte=start_of_week)

    month_orders = orders_base.filter(created_at__gte=start_of_month)
    month_payments = payments_base.filter(created_at__gte=start_of_month)

    last_order = orders_base.order_by("-created_at").first()

    return {
        "today": aggregate_sales_metrics(today_orders, today_payments),
        "this_week": aggregate_sales_metrics(week_orders, week_payments),
        "this_month": aggregate_sales_metrics(month_orders, month_payments),
        "all_time": aggregate_sales_metrics(orders_base, payments_base),
        "last_order_at": last_order.created_at.isoformat() if last_order else None,
    }


def calculate_company_sales_summary(now: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Compute company-wide sales metrics directly via database queries without iterating users.
    Single Responsibility: Company-level sales aggregation.
    """
    if now is None:
        now = timezone.now()

    start_of_today, _ = parse_date_range_bounds("today", now=now)
    start_of_week, _ = parse_date_range_bounds("week", now=now)
    start_of_month, _ = parse_date_range_bounds("month", now=now)

    valid_orders = SalesOrder.objects.exclude(status=SalesOrder.Status.CANCELLED)

    def _period_summary(start_dt: datetime) -> Dict[str, Any]:
        agg = valid_orders.filter(created_at__gte=start_dt).aggregate(
            total_sales=Sum("grand_total"),
            order_count=Count("id"),
        )
        return {
            "total_sales": float(agg["total_sales"] or Decimal("0.00")),
            "order_count": agg["order_count"] or 0,
        }

    return {
        "today": _period_summary(start_of_today),
        "this_week": _period_summary(start_of_week),
        "this_month": _period_summary(start_of_month),
    }


def serialize_order_item(item: SalesOrderItem) -> Dict[str, Any]:
    """
    Format an individual sales order item into a clean dictionary.
    Single Responsibility: Order item serialization.
    """
    return {
        "product_id": item.product_id,
        "product_name": item.product.name if item.product else "Item",
        "quantity": float(item.quantity),
        "unit_price": float(item.unit_price),
        "line_total": float(item.line_total),
    }


def serialize_order_invoice(order: SalesOrder) -> Optional[Dict[str, Any]]:
    """
    Format invoice information linked to a sales order.
    Single Responsibility: Order invoice serialization.
    """
    try:
        if hasattr(order, "invoice") and order.invoice:
            inv = order.invoice
            return {
                "invoice_number": inv.invoice_number,
                "status": inv.status,
                "grand_total": float(inv.grand_total),
                "paid_total": float(inv.paid_total),
                "balance_due": float(inv.balance_due),
            }
    except Exception:
        pass
    return None


def serialize_order_detail(order: SalesOrder) -> Dict[str, Any]:
    """
    Format a sales order with its items and invoice into a clean dictionary.
    Single Responsibility: Single order serialization.
    """
    active_items = [
        serialize_order_item(item)
        for item in order.items.all()
        if item.status != SalesOrderItem.Status.VOIDED
    ]

    return {
        "id": order.id,
        "order_number": order.order_number,
        "table_name": order.table_name or "Counter / Takeaway",
        "customer_name": order.customer_name or "Walk-in Guest",
        "status": order.status,
        "service_point_name": order.service_point.name if order.service_point else "General",
        "service_point_kind": order.service_point.kind if order.service_point else None,
        "subtotal": float(order.subtotal),
        "tax_total": float(order.tax_total),
        "discount_total": float(order.discount_total),
        "grand_total": float(order.grand_total),
        "created_at": order.created_at.isoformat(),
        "invoice": serialize_order_invoice(order),
        "items_count": len(active_items),
        "items": active_items,
    }


def get_top_products_breakdown(orders_qs: QuerySet, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Aggregate the most sold products from an orders QuerySet.
    Single Responsibility: Top product sales calculation.
    """
    top_products = (
        SalesOrderItem.objects.filter(order__in=orders_qs)
        .exclude(status=SalesOrderItem.Status.VOIDED)
        .values("product__id", "product__name")
        .annotate(
            total_quantity=Sum("quantity"),
            total_amount=Sum("line_total"),
        )
        .order_by("-total_amount")[:limit]
    )
    return [
        {
            "product_id": item["product__id"],
            "product_name": item["product__name"] or "Item",
            "quantity": float(item["total_quantity"] or 0),
            "total_amount": float(item["total_amount"] or 0),
        }
        for item in top_products
    ]


def get_service_points_breakdown(orders_qs: QuerySet) -> List[Dict[str, Any]]:
    """
    Aggregate orders and sales volume by service point.
    Single Responsibility: Service point breakdown calculation.
    """
    sp_breakdown = (
        orders_qs.values("service_point__name")
        .annotate(
            orders_count=Count("id"),
            total_sales=Sum("grand_total"),
        )
        .order_by("-total_sales")
    )
    return [
        {
            "service_point_name": item["service_point__name"] or "General",
            "orders_count": item["orders_count"],
            "total_sales": float(item["total_sales"] or 0),
        }
        for item in sp_breakdown
    ]


def get_payments_breakdown(payments_qs: QuerySet, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Format payment transactions for an employee.
    Single Responsibility: Payment history serialization.
    """
    payments = (
        payments_qs.select_related("payment_method", "invoice")
        .order_by("-created_at")[:limit]
    )
    return [
        {
            "id": p.id,
            "invoice_number": p.invoice.invoice_number if p.invoice else "-",
            "payment_method_name": p.payment_method.name if p.payment_method else "-",
            "amount": float(p.amount),
            "currency": p.currency,
            "reference": p.reference,
            "status": p.status,
            "created_at": p.created_at.isoformat(),
        }
        for p in payments
    ]


def get_user_profile_payload(user: UserIdentity) -> Dict[str, Any]:
    """
    Format user identity profile data.
    Single Responsibility: User profile representation.
    """
    return {
        "keycloak_sub": user.keycloak_sub,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": get_user_display_name(user),
        "realm_roles": user.realm_roles or [],
        "is_active": user.is_active,
    }


def get_user_sales_summary_payload(user: UserIdentity, now: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Build a comprehensive summary of a single user's sales performance.
    Single Responsibility: User sales summary construction.
    """
    stats = calculate_user_sales_stats(user, now=now)
    user_payload = get_user_profile_payload(user)
    return {
        **user_payload,
        "today": stats["today"],
        "this_week": stats["this_week"],
        "this_month": stats["this_month"],
        "all_time": stats["all_time"],
        "last_order_at": stats["last_order_at"],
    }


def get_user_sales_detail_payload(
    user: UserIdentity,
    period: str = "today",
    start_str: Optional[str] = None,
    end_str: Optional[str] = None,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """
    Assemble the complete detailed sales performance payload for a single user.
    Single Responsibility: User detailed sales data composition.
    """
    if now is None:
        now = timezone.now()

    date_start, date_end = parse_date_range_bounds(period, start_str, end_str, now=now)

    orders_qs = (
        get_user_orders_queryset(user, start_date=date_start, end_date=date_end)
        .select_related("service_point", "branch")
        .prefetch_related("items__product", "invoice")
        .order_by("-created_at")
    )
    payments_qs = get_user_payments_queryset(user, start_date=date_start, end_date=date_end)

    orders_data = [serialize_order_detail(order) for order in orders_qs[:150]]
    stats = calculate_user_sales_stats(user, now=now)
    top_products_data = get_top_products_breakdown(orders_qs)
    sp_data = get_service_points_breakdown(orders_qs)
    payments_data = get_payments_breakdown(payments_qs)

    return {
        "user": get_user_profile_payload(user),
        "summary": stats,
        "selected_period": period,
        "date_range": {
            "start": date_start.isoformat() if date_start else None,
            "end": date_end.isoformat() if date_end else None,
        },
        "orders": orders_data,
        "top_products": top_products_data,
        "service_points": sp_data,
        "payments_received": payments_data,
    }
