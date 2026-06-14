import os
from decimal import Decimal

from django.core.files.base import ContentFile
from django.db import models, transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import ServicePoint
from apps.users.models import UserIdentity
from apps.pagination import paginated_response

from .models import CustomerPaymentRun, CustomerPaymentRunAllocation, GuestVisit, SalesInvoice, SalesOrder, SalesOrderItem, SalesPayment
from .serializers import CustomerPaymentRunSerializer, GuestVisitSerializer, SalesInvoiceDetailSerializer, SalesInvoiceSerializer, SalesOrderItemSerializer, SalesOrderSerializer, SalesPaymentDetailSerializer, SalesPaymentSerializer


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


def generate_receipt_filename(invoice):
    safe_number = invoice.invoice_number.replace("/", "-").replace(" ", "_")
    return f"{safe_number}.pdf"


def staff_display_name(keycloak_sub):
    if not keycloak_sub:
        return ""

    identity = UserIdentity.objects.filter(keycloak_sub=keycloak_sub).first()
    if not identity:
        return "Staff member"

    full_name = " ".join(
        part.strip() for part in (identity.first_name, identity.last_name) if part.strip()
    )
    return full_name or identity.username or identity.email or "Staff member"


def generate_payment_receipt_pdf(invoice):
    from io import BytesIO
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    items = list(
        invoice.order.items.exclude(status=SalesOrderItem.Status.VOIDED).select_related("product")
    )
    payments = list(
        invoice.payments.filter(status=SalesPayment.Status.CLEARED).select_related("payment_method")
    )
    page_width = 80 * mm
    content_lines = 31 + len(items) + max(len(payments), 1)
    page_height = max(145 * mm, (content_lines * 4.7 + 18) * mm)
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(page_width, page_height))
    margin = 6 * mm
    right = page_width - margin
    center = page_width / 2
    line_height = 4.6 * mm
    y = page_height - 8 * mm

    def centered(text, font="Helvetica", size=8):
        nonlocal y
        c.setFont(font, size)
        c.drawCentredString(center, y, str(text))
        y -= line_height

    def pair(label, value, font="Helvetica", size=8):
        nonlocal y
        c.setFont(font, size)
        c.drawString(margin, y, str(label))
        c.drawRightString(right, y, str(value))
        y -= line_height

    def rule():
        nonlocal y
        y -= 1 * mm
        c.setDash(1, 2)
        c.line(margin, y, right, y)
        c.setDash()
        y -= 3.5 * mm

    latest_payment = payments[-1] if payments else None
    receipt_number = f"RCT-{latest_payment.id:06d}" if latest_payment else invoice.invoice_number
    receipt_time = latest_payment.created_at if latest_payment else invoice.created_at
    visit = invoice.order.visit

    centered("G8 YACHT VILLA", "Helvetica-Bold", 13)
    centered("Embu, Kenya", "Helvetica", 8)
    centered("PAYMENT RECEIPT" if payments else "UNPAID BILL", "Helvetica-Bold", 10)
    centered("PAID" if invoice.balance_due <= 0 and payments else invoice.status.replace("_", " "), "Helvetica-Bold", 9)
    rule()

    pair("Receipt", receipt_number)
    pair("Date", timezone.localtime(receipt_time).strftime("%d %b %Y  %H:%M"))
    pair("Invoice", invoice.invoice_number)
    pair("Order", invoice.order.order_number)
    if invoice.branch:
        pair("Branch", invoice.branch.name[:24])
    if visit:
        pair("Location", f"{visit.service_area} {visit.table_name}".strip()[:28])
    pair("Guest", (invoice.customer_name or (visit.guest_name if visit else "") or "Walk-in guest")[:28])
    rule()

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "ITEM")
    c.drawRightString(right, y, "AMOUNT")
    y -= line_height
    for item in items:
        quantity = f"{item.quantity:g}"
        c.setFont("Helvetica", 8)
        c.drawString(margin, y, f"{quantity} x {str(item.product.name)[:24]}")
        c.drawRightString(right, y, f"{item.line_total:,.2f}")
        y -= line_height

    rule()
    pair("Subtotal", f"KES {invoice.subtotal:,.2f}")
    if invoice.tax_total:
        pair("Tax", f"KES {invoice.tax_total:,.2f}")
    if invoice.discount_total:
        pair("Discount", f"- KES {invoice.discount_total:,.2f}")
    pair("TOTAL", f"KES {invoice.grand_total:,.2f}", "Helvetica-Bold", 10)
    rule()

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "PAYMENT")
    c.drawRightString(right, y, "AMOUNT")
    y -= line_height
    if payments:
        for payment in payments:
            method = payment.payment_method.name
            reference = f" ({payment.reference})" if payment.reference else ""
            c.setFont("Helvetica", 8)
            c.drawString(margin, y, f"{method}{reference}"[:31])
            c.drawRightString(right, y, f"{payment.amount:,.2f}")
            y -= line_height
    else:
        pair("No payment received", "0.00")

    rule()
    pair("AMOUNT PAID", f"KES {invoice.paid_total:,.2f}", "Helvetica-Bold", 10)
    pair("BALANCE", f"KES {invoice.balance_due:,.2f}", "Helvetica-Bold", 9)
    if latest_payment and latest_payment.received_by:
        pair("Served by", staff_display_name(latest_payment.received_by)[:24])
    rule()

    centered("Thank you for visiting G8 Yacht Villa.", "Helvetica-Bold", 8)
    centered("Please keep this receipt as proof of payment.", "Helvetica", 7)
    c.save()
    buffer.seek(0)
    return buffer


def generate_invoice_receipt(invoice):
    buffer = generate_payment_receipt_pdf(invoice)
    filename = generate_receipt_filename(invoice)
    if invoice.receipt_file:
        invoice.receipt_file.delete(save=False)
    invoice.receipt_file.save(filename, ContentFile(buffer.getvalue()), save=False)
    invoice.save(update_fields=["receipt_file"])


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
    generate_invoice_receipt(invoice)
    return invoice


def create_invoice_from_order_with_issuer(order, issued_by=''):
    invoice = create_invoice_from_order(order)
    if issued_by:
        invoice.issued_by = issued_by
        invoice.save(update_fields=["issued_by"])
        generate_invoice_receipt(invoice)
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
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(
            SalesOrder.objects.select_related(
                "branch",
                "service_point",
                "visit",
                "invoice",
            ).prefetch_related(
                "items__product",
                "items__service_point",
            ),
            pk=pk,
        )
        return Response(SalesOrderSerializer(order, context={"request": request}).data)

    def patch(self, request, pk):
        order = get_object_or_404(SalesOrder, pk=pk)
        if order.status == SalesOrder.Status.INVOICED:
            return Response({"detail": "Invoiced orders are locked."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SalesOrderSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(SalesOrderSerializer(order).data)


class SalesOrderSendView(APIView):
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
        return SalesInvoice.objects.select_related(
            "branch",
            "order",
            "order__service_point",
            "order__visit",
        ).prefetch_related(
            "order__items__product",
            "order__items__service_point",
            "payments__payment_method",
        )


class SalesInvoiceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        invoice = get_object_or_404(
            SalesInvoice.objects.select_related(
                "branch",
                "order",
                "order__service_point",
                "order__visit",
            ).prefetch_related(
                "order__items__product",
                "order__items__service_point",
                "payments__payment_method",
            ),
            pk=pk,
        )
        return Response(SalesInvoiceDetailSerializer(invoice, context={"request": request}).data)


class SalesInvoiceCreateFromOrderView(APIView):
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        visit = get_object_or_404(GuestVisit, pk=pk)
        visit.waiter_acknowledged_at = timezone.now()
        visit.waiter_keycloak_sub = getattr(request.user, "keycloak_sub", "") or ""
        visit.save(update_fields=["waiter_acknowledged_at", "waiter_keycloak_sub", "updated_at"])
        return Response(GuestVisitSerializer(visit).data)


class GuestVisitDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        visit = get_object_or_404(GuestVisit, pk=pk)
        return Response(GuestVisitSerializer(visit).data)


class SalesOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]
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
        generate_invoice_receipt(invoice)
        if invoice.status == SalesInvoice.Status.CLOSED and invoice.order.visit_id:
            visit = invoice.order.visit
            outstanding = visit.orders.filter(invoice__balance_due__gt=0).exists()
            uninvoiced = visit.orders.exclude(status__in=[SalesOrder.Status.INVOICED, SalesOrder.Status.CANCELLED]).exists()
            if not outstanding and not uninvoiced:
                visit.status = GuestVisit.Status.CLOSED
                visit.closed_at = timezone.now()
                visit.save(update_fields=["status", "closed_at", "updated_at"])
        return Response(self.serializer_class(payment).data, status=status.HTTP_201_CREATED)


class SalesPaymentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        payment = get_object_or_404(
            SalesPayment.objects.select_related(
                "payment_method",
                "invoice",
                "invoice__order",
                "invoice__order__service_point",
                "invoice__order__visit",
            ),
            pk=pk,
        )
        return Response(SalesPaymentDetailSerializer(payment).data)


class GuestVisitCheckoutAuthView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        visit = get_object_or_404(GuestVisit, pk=pk)
        if visit.status == GuestVisit.Status.CLOSED:
            return Response({"detail": "This stay is already paid and closed."}, status=status.HTTP_400_BAD_REQUEST)
        for order in visit.orders.exclude(status=SalesOrder.Status.CANCELLED):
            if not hasattr(order, "invoice"):
                create_invoice_from_order_with_issuer(order, issued_by=getattr(request.user, "keycloak_sub", "") or "")
        visit.status = GuestVisit.Status.CHECKOUT_REQUESTED
        visit.checkout_requested_at = timezone.now()
        visit.save(update_fields=["status", "checkout_requested_at", "updated_at"])
        return Response(GuestVisitSerializer(visit).data)


class SalesInvoiceReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        invoice = get_object_or_404(SalesInvoice, pk=pk)
        try:
            # Regenerate on download so older invoice-styled files and later payments
            # never leave a stale receipt in storage.
            generate_invoice_receipt(invoice)
            invoice.refresh_from_db(fields=["receipt_file"])
            return FileResponse(
                invoice.receipt_file.open("rb"),
                content_type="application/pdf",
                filename=f"receipt-{invoice.invoice_number}.pdf",
            )
        except Exception:
            return Response({"detail": "Failed to generate receipt."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    permission_classes = [IsAuthenticated]

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
