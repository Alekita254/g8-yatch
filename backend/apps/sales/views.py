from decimal import Decimal

from django.db import models, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager
from apps.users.models import ServicePoint
from apps.pagination import paginated_response

from .models import CustomerPaymentRun, CustomerPaymentRunAllocation, GuestVisit, SalesInvoice, SalesOrder, SalesOrderItem, SalesPayment
from .serializers import CustomerPaymentRunSerializer, GuestVisitSerializer, SalesInvoiceSerializer, SalesOrderItemSerializer, SalesOrderSerializer, SalesPaymentSerializer


def next_number(prefix, model, field):
    count = model.objects.count() + 1
    return f"{prefix}-{timezone.now():%Y%m%d}-{count:05d}"


def build_fiscal_payload(order):
    items = order.items.exclude(status=SalesOrderItem.Status.VOIDED).values(
        "product_id",
        "quantity",
        "unit_price",
        "line_total",
    )
    return {
        "order_number": order.order_number,
        "items": [
            {
                "product_id": item["product_id"],
                "quantity": str(item["quantity"]),
                "unit_price": str(item["unit_price"]),
                "line_total": str(item["line_total"]),
            }
            for item in items
        ],
    }


def create_invoice_from_order(order):
    invoice = SalesInvoice.objects.create(
        invoice_number=next_number("INV", SalesInvoice, "invoice_number"),
        order=order,
        branch=order.branch,
        customer_name=order.customer_name,
        subtotal=order.subtotal,
        tax_total=order.tax_total,
        discount_total=order.discount_total,
        grand_total=order.grand_total,
        balance_due=order.grand_total,
        fiscal_payload=build_fiscal_payload(order),
    )
    order.status = SalesOrder.Status.INVOICED
    order.save(update_fields=["status", "updated_at"])
    return invoice


def find_or_create_visit(*, service_point, table_name, customer_name=""):
    normalized_table = table_name.strip()
    if not service_point or not normalized_table:
        return None

    visit = GuestVisit.objects.filter(
        service_point=service_point,
        table_name__iexact=normalized_table,
        status=GuestVisit.Status.ACTIVE,
    ).first()
    if visit:
        if customer_name and not visit.guest_name:
            visit.guest_name = customer_name
            visit.save(update_fields=["guest_name", "updated_at"])
        return visit

    return GuestVisit.objects.create(
        visit_number=next_number("VIS", GuestVisit, "visit_number"),
        service_point=service_point,
        service_area=service_point.get_kind_display(),
        table_name=normalized_table,
        guest_name=customer_name,
    )


class ListCreateMixin(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def get_queryset(self):
        return self.model.objects.all()

    def get(self, request):
        queryset = self.get_queryset()
        return paginated_response(request, queryset, self.serializer_class)


class SalesOrderListCreateView(ListCreateMixin):
    model = SalesOrder
    serializer_class = SalesOrderSerializer

    def get_queryset(self):
        return SalesOrder.objects.select_related("branch", "service_point").prefetch_related("items")

    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        data["order_number"] = next_number("SO", SalesOrder, "order_number")
        if not data.get("visit") and data.get("service_point") and str(data.get("table_name", "")).strip():
            service_point = get_object_or_404(ServicePoint, pk=data["service_point"])
            visit = find_or_create_visit(
                service_point=service_point,
                table_name=str(data.get("table_name", "")),
                customer_name=str(data.get("customer_name", "")).strip(),
            )
            data["visit"] = visit.pk
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(
            order_number=data["order_number"],
            waiter_keycloak_sub=getattr(request.user, "keycloak_sub", "") or "",
        )
        return Response(self.serializer_class(order).data, status=status.HTTP_201_CREATED)


class SalesOrderDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, pk):
        order = get_object_or_404(SalesOrder, pk=pk)
        if order.status == SalesOrder.Status.INVOICED:
            return Response({"detail": "Invoiced orders are locked."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SalesOrderSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(SalesOrderSerializer(order).data)


class SalesOrderSendView(APIView):
    permission_classes = [IsPosManager]

    def post(self, request, pk):
        order = get_object_or_404(SalesOrder, pk=pk)
        pending_items = order.items.filter(status=SalesOrderItem.Status.PENDING_SEND)
        now = timezone.now()
        for item in pending_items:
            item.status = SalesOrderItem.Status.SENT_TO_KITCHEN
            item.sent_at = now
            item.routed_station = item.product.category.route_station if item.product.category_id else ""
            item.save(update_fields=["status", "sent_at", "routed_station"])
        order.status = SalesOrder.Status.SENT
        order.save(update_fields=["status", "updated_at"])
        return Response(SalesOrderSerializer(order).data)


class SalesOrderItemVoidView(APIView):
    permission_classes = [IsPosManager]

    def post(self, request, pk, item_id):
        item = get_object_or_404(SalesOrderItem, pk=item_id, order_id=pk)
        item.status = SalesOrderItem.Status.VOIDED
        item.void_reason = request.data.get("void_reason", "")
        item.voided_by = getattr(request.user, "keycloak_sub", "") or ""
        item.voided_at = timezone.now()
        item.save(update_fields=["status", "void_reason", "voided_by", "voided_at"])
        return Response(SalesOrderItemSerializer(item).data)


class SalesInvoiceListView(ListCreateMixin):
    model = SalesInvoice
    serializer_class = SalesInvoiceSerializer

    def get_queryset(self):
        return SalesInvoice.objects.select_related("order", "branch").prefetch_related("payments")


class SalesInvoiceCreateFromOrderView(APIView):
    permission_classes = [IsPosManager]

    @transaction.atomic
    def post(self, request, order_id):
        order = get_object_or_404(SalesOrder, pk=order_id)
        if order.status == SalesOrder.Status.INVOICED:
            return Response({"detail": "Order is already invoiced."}, status=status.HTTP_400_BAD_REQUEST)

        invoice = create_invoice_from_order(order)
        return Response(SalesInvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class GuestVisitListView(ListCreateMixin):
    model = GuestVisit
    serializer_class = GuestVisitSerializer

    def get_queryset(self):
        return GuestVisit.objects.select_related("service_point").prefetch_related(
            "orders__items__product",
            "orders__invoice__payments",
        )


class GuestVisitWaiterAcknowledgeView(APIView):
    permission_classes = [IsPosManager]

    def post(self, request, pk):
        visit = get_object_or_404(GuestVisit, pk=pk)
        visit.waiter_acknowledged_at = timezone.now()
        visit.waiter_keycloak_sub = getattr(request.user, "keycloak_sub", "") or ""
        visit.save(update_fields=["waiter_acknowledged_at", "waiter_keycloak_sub", "updated_at"])
        return Response(GuestVisitSerializer(visit).data)


class GuestVisitDetailView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request, pk):
        visit = get_object_or_404(GuestVisit, pk=pk)
        return Response(GuestVisitSerializer(visit).data)


class SalesOrderStatusView(APIView):
    permission_classes = [IsPosManager]
    transitions = {
        SalesOrder.Status.SENT: {SalesOrder.Status.PREPARING, SalesOrder.Status.CANCELLED},
        SalesOrder.Status.PREPARING: {SalesOrder.Status.READY, SalesOrder.Status.CANCELLED},
        SalesOrder.Status.READY: {SalesOrder.Status.SERVED},
        SalesOrder.Status.SERVED: set(),
    }

    def post(self, request, pk):
        order = get_object_or_404(SalesOrder, pk=pk)
        next_status = request.data.get("status")
        if next_status not in self.transitions.get(order.status, set()):
            return Response(
                {"detail": f"Order cannot move from {order.status} to {next_status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = next_status
        order.save(update_fields=["status", "updated_at"])
        return Response(SalesOrderSerializer(order).data)


class SalesPaymentListCreateView(ListCreateMixin):
    model = SalesPayment
    serializer_class = SalesPaymentSerializer

    def get_queryset(self):
        return SalesPayment.objects.select_related("invoice", "payment_method")

    @transaction.atomic
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(received_by=getattr(request.user, "keycloak_sub", "") or "")
        invoice = payment.invoice
        cleared_total = invoice.payments.filter(status=SalesPayment.Status.CLEARED).aggregate(models.Sum("amount"))["amount__sum"] or Decimal("0")
        invoice.paid_total = cleared_total
        invoice.balance_due = max(invoice.grand_total - cleared_total, Decimal("0"))
        invoice.status = SalesInvoice.Status.CLOSED if invoice.balance_due <= 0 else SalesInvoice.Status.PARTIALLY_PAID
        invoice.save(update_fields=["paid_total", "balance_due", "status"])
        if invoice.status == SalesInvoice.Status.CLOSED and invoice.order.visit_id:
            visit = invoice.order.visit
            outstanding = visit.orders.filter(invoice__balance_due__gt=0).exists()
            uninvoiced = visit.orders.exclude(status__in=[SalesOrder.Status.INVOICED, SalesOrder.Status.CANCELLED]).exists()
            if not outstanding and not uninvoiced:
                visit.status = GuestVisit.Status.CLOSED
                visit.closed_at = timezone.now()
                visit.save(update_fields=["status", "closed_at", "updated_at"])
        return Response(self.serializer_class(payment).data, status=status.HTTP_201_CREATED)


class CustomerPaymentRunListCreateView(ListCreateMixin):
    model = CustomerPaymentRun
    serializer_class = CustomerPaymentRunSerializer

    def post(self, request):
        data = request.data.copy()
        data["run_number"] = next_number("CPR", CustomerPaymentRun, "run_number")
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        run = serializer.save(run_number=data["run_number"], unapplied_amount=serializer.validated_data["amount"])
        return Response(self.serializer_class(run).data, status=status.HTTP_201_CREATED)


class CustomerPaymentRunApplyView(APIView):
    permission_classes = [IsPosManager]

    @transaction.atomic
    def post(self, request, pk):
        run = get_object_or_404(CustomerPaymentRun, pk=pk)
        remaining = run.amount
        invoices = SalesInvoice.objects.select_for_update().filter(
            customer_name=run.customer_name,
            status__in=[SalesInvoice.Status.UNPAID, SalesInvoice.Status.PARTIALLY_PAID],
        ).order_by("created_at")

        for invoice in invoices:
            if remaining <= 0:
                break
            allocation = min(invoice.balance_due, remaining)
            CustomerPaymentRunAllocation.objects.create(payment_run=run, invoice=invoice, amount=allocation)
            invoice.paid_total += allocation
            invoice.balance_due = max(invoice.grand_total - invoice.paid_total, Decimal("0"))
            invoice.status = SalesInvoice.Status.CLOSED if invoice.balance_due <= 0 else SalesInvoice.Status.PARTIALLY_PAID
            invoice.save(update_fields=["paid_total", "balance_due", "status"])
            remaining -= allocation

        run.unapplied_amount = remaining
        run.status = CustomerPaymentRun.Status.APPLIED
        run.applied_at = timezone.now()
        run.save(update_fields=["unapplied_amount", "status", "applied_at"])
        return Response(CustomerPaymentRunSerializer(run).data)
