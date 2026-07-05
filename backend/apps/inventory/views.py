from decimal import Decimal

from django.http import FileResponse
from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.pagination import paginated_response
from apps.products.models import Product
from apps.users.permissions import IsPosManager

from .models import InventoryDocument, InventoryDocumentLine, InventoryThreshold, StockMovement
from .serializers import (
    InventoryDocumentSerializer,
    InventoryThresholdSerializer,
    LowStockProductSerializer,
    StockMovementSerializer,
)


def pdf_filename(document):
    safe_number = "".join(char if char.isalnum() or char in "-_" else "-" for char in document.document_number)
    return f"{safe_number}.pdf"


def generate_inventory_document_pdf(document):
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    document = (
        InventoryDocument.objects.select_related("source_document", "created_by", "purchase_pricelist")
        .prefetch_related("lines", "lines__product", "lines__product__category")
        .get(pk=document.pk)
    )
    lines = list(document.lines.select_related("product", "product__category"))
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    page_width, page_height = A4
    margin = 16 * mm
    right = page_width - margin
    y = page_height - margin
    line_height = 7 * mm

    def draw_header():
        nonlocal y
        c.setFont("Helvetica-Bold", 16)
        c.drawString(margin, y, "G8 YACHT VILLA")
        c.setFont("Helvetica", 9)
        c.drawRightString(right, y, timezone.localtime(document.created_at).strftime("%d %b %Y"))
        y -= 8 * mm
        c.setFont("Helvetica-Bold", 13)
        c.drawString(margin, y, document.get_document_type_display().upper())
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(right, y, document.document_number)
        y -= 5 * mm
        c.setLineWidth(1)
        c.line(margin, y, right, y)
        y -= 7 * mm

    def pair(label, value, x=margin):
        nonlocal y
        c.setFont("Helvetica-Bold", 8)
        c.drawString(x, y, str(label).upper())
        c.setFont("Helvetica", 9)
        c.drawString(x + 35 * mm, y, str(value or "-"))
        y -= 5 * mm

    def new_page_if_needed(height=25 * mm):
        nonlocal y
        if y < margin + height:
            c.showPage()
            y = page_height - margin
            draw_header()

    draw_header()
    pair("Status", document.get_status_display())
    pair("Supplier", document.supplier_name or "Not specified")
    if document.source_document:
        pair("Source", document.source_document.document_number)
    if document.approved_at:
        pair("Approved", timezone.localtime(document.approved_at).strftime("%d %b %Y %H:%M"))
    if document.received_at:
        pair("Received", timezone.localtime(document.received_at).strftime("%d %b %Y %H:%M"))
    if document.notes:
        pair("Notes", document.notes[:80])
    y -= 3 * mm

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "PRODUCT")
    c.drawRightString(116 * mm, y, "QTY")
    c.drawRightString(145 * mm, y, "UNIT COST")
    c.drawRightString(right, y, "AMOUNT")
    y -= 3 * mm
    c.line(margin, y, right, y)
    y -= 5 * mm

    total = Decimal("0")
    for line in lines:
        new_page_if_needed()
        amount = line.requested_quantity * line.unit_cost
        total += amount
        c.setFont("Helvetica-Bold", 9)
        c.drawString(margin, y, line.product.name[:45])
        c.setFont("Helvetica", 8)
        c.drawString(margin, y - 4 * mm, f"{line.product.sku} · {line.product.unit}")
        c.drawRightString(116 * mm, y, f"{line.requested_quantity:g}")
        c.drawRightString(145 * mm, y, f"{line.unit_cost:,.2f}")
        c.drawRightString(right, y, f"{amount:,.2f}")
        y -= line_height + 2 * mm

    y -= 2 * mm
    c.line(120 * mm, y, right, y)
    y -= 6 * mm
    c.setFont("Helvetica-Bold", 10)
    c.drawRightString(145 * mm, y, "TOTAL")
    c.drawRightString(right, y, f"KES {total:,.2f}")
    y -= 14 * mm

    new_page_if_needed(30 * mm)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, y, "Prepared by")
    c.drawString(82 * mm, y, "Approved by")
    c.drawString(148 * mm, y, "Received by")
    y -= 10 * mm
    c.line(margin, y, 62 * mm, y)
    c.line(82 * mm, y, 128 * mm, y)
    c.line(148 * mm, y, right, y)
    y -= 7 * mm
    c.setFont("Helvetica", 8)
    prepared_by = document.created_by
    prepared_name = ""
    if prepared_by:
        prepared_name = " ".join(part for part in [prepared_by.first_name, prepared_by.last_name] if part).strip()
        prepared_name = prepared_name or prepared_by.username or prepared_by.email
    c.drawString(margin, y, prepared_name or "Inventory")
    c.drawCentredString(105 * mm, y, "Name / Signature")
    c.drawCentredString(171 * mm, y, "Name / Signature")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer


class InventoryThresholdListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        queryset = InventoryThreshold.objects.select_related("product", "product__category")
        return paginated_response(request, queryset, InventoryThresholdSerializer)

    def post(self, request):
        serializer = InventoryThresholdSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        threshold = serializer.save()
        return Response(InventoryThresholdSerializer(threshold).data, status=status.HTTP_201_CREATED)


class InventoryThresholdDetailView(APIView):
    permission_classes = [IsPosManager]

    def patch(self, request, pk):
        threshold = get_object_or_404(InventoryThreshold.objects.select_related("product"), pk=pk)
        serializer = InventoryThresholdSerializer(threshold, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        threshold = serializer.save()
        return Response(InventoryThresholdSerializer(threshold).data)

    def delete(self, request, pk):
        threshold = get_object_or_404(InventoryThreshold, pk=pk)
        threshold.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LowStockProductListView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        queryset = Product.objects.select_related("category", "inventory_threshold").filter(
            is_active=True,
            is_inventory_tracked=True,
            inventory_threshold__is_active=True,
            quantity__lte=F("inventory_threshold__minimum_quantity"),
        )
        return paginated_response(request, queryset, LowStockProductSerializer)


class InventoryDocumentListCreateView(APIView):
    permission_classes = [IsPosManager]

    def get_queryset(self):
        return InventoryDocument.objects.select_related("source_document", "purchase_pricelist").prefetch_related(
            "lines",
            "lines__product",
            "lines__product__category",
        )

    def get(self, request):
        queryset = self.get_queryset()
        document_type = request.query_params.get("document_type")
        status_value = request.query_params.get("status")
        if document_type:
            queryset = queryset.filter(document_type=document_type)
        if status_value:
            queryset = queryset.filter(status=status_value)
        return paginated_response(request, queryset, InventoryDocumentSerializer)

    def post(self, request):
        serializer = InventoryDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identity = getattr(request.user, "identity", None)
        document = serializer.save(created_by=identity)
        return Response(InventoryDocumentSerializer(document).data, status=status.HTTP_201_CREATED)


class InventoryDocumentDetailView(APIView):
    permission_classes = [IsPosManager]

    def get_queryset(self):
        return InventoryDocument.objects.select_related("source_document", "purchase_pricelist").prefetch_related(
            "lines",
            "lines__product",
            "lines__product__category",
        )

    def get(self, request, pk):
        document = get_object_or_404(self.get_queryset(), pk=pk)
        return Response(InventoryDocumentSerializer(document).data)

    def patch(self, request, pk):
        document = get_object_or_404(self.get_queryset(), pk=pk)
        if document.status in [InventoryDocument.Status.APPROVED, InventoryDocument.Status.RECEIVED]:
            return Response({"detail": "Approved or received documents cannot be edited."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = InventoryDocumentSerializer(document, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        return Response(InventoryDocumentSerializer(document).data)


class InventoryDocumentPdfView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request, pk):
        document = (
            InventoryDocument.objects.prefetch_related("lines", "lines__product")
            .filter(pk=pk)
            .first()
        )
        if not document:
            return Response(
                {"detail": f"Inventory document {pk} was not found. Refresh the page and try the latest document."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if document.document_type not in [
            InventoryDocument.DocumentType.PURCHASE_REQUEST,
            InventoryDocument.DocumentType.REQUISITION,
            InventoryDocument.DocumentType.GOODS_DELIVERY_NOTE,
            InventoryDocument.DocumentType.GOODS_RECEIVED_NOTE,
        ]:
            return Response({"detail": "This document cannot be exported as a PDF."}, status=status.HTTP_400_BAD_REQUEST)
        return FileResponse(
            generate_inventory_document_pdf(document),
            as_attachment=True,
            content_type="application/pdf",
            filename=pdf_filename(document),
        )


def copy_lines(source, target, received=False):
    for line in source.lines.select_related("product").all():
        InventoryDocumentLine.objects.create(
            document=target,
            product=line.product,
            requested_quantity=line.requested_quantity,
            received_quantity=line.requested_quantity if received else Decimal("0"),
            unit_cost=line.unit_cost,
            notes=line.notes,
        )


class InventoryDocumentApproveView(APIView):
    permission_classes = [IsPosManager]

    def post(self, request, pk):
        document = get_object_or_404(InventoryDocument, pk=pk)
        if document.document_type != InventoryDocument.DocumentType.PURCHASE_REQUEST:
            return Response({"detail": "Only purchase requests can be approved."}, status=status.HTTP_400_BAD_REQUEST)
        if document.status == InventoryDocument.Status.RECEIVED:
            return Response({"detail": "Received documents cannot be approved again."}, status=status.HTTP_400_BAD_REQUEST)
        document.status = InventoryDocument.Status.APPROVED
        document.approved_at = timezone.now()
        document.save(update_fields=["status", "approved_at", "updated_at"])
        return Response(InventoryDocumentSerializer(document).data)


class InventoryDocumentRequisitionView(APIView):
    permission_classes = [IsPosManager]

    @transaction.atomic
    def post(self, request, pk):
        source = get_object_or_404(InventoryDocument.objects.prefetch_related("lines"), pk=pk)
        if source.document_type != InventoryDocument.DocumentType.PURCHASE_REQUEST or source.status != InventoryDocument.Status.APPROVED:
            return Response({"detail": "Approve the purchase request before creating a requisition."}, status=status.HTTP_400_BAD_REQUEST)
        requisition = InventoryDocument.objects.create(
            document_type=InventoryDocument.DocumentType.REQUISITION,
            status=InventoryDocument.Status.APPROVED,
            supplier_name=source.supplier_name,
            purchase_pricelist=source.purchase_pricelist,
            source_document=source,
            notes=source.notes,
            created_by=getattr(request.user, "identity", None),
            approved_at=timezone.now(),
        )
        copy_lines(source, requisition)
        return Response(InventoryDocumentSerializer(requisition).data, status=status.HTTP_201_CREATED)


class InventoryDocumentDeliveryNoteView(APIView):
    permission_classes = [IsPosManager]

    @transaction.atomic
    def post(self, request, pk):
        source = get_object_or_404(InventoryDocument.objects.prefetch_related("lines"), pk=pk)
        if source.document_type != InventoryDocument.DocumentType.REQUISITION:
            return Response({"detail": "Create delivery notes from requisitions only."}, status=status.HTTP_400_BAD_REQUEST)
        delivery_note = InventoryDocument.objects.create(
            document_type=InventoryDocument.DocumentType.GOODS_DELIVERY_NOTE,
            status=InventoryDocument.Status.SUBMITTED,
            supplier_name=source.supplier_name,
            purchase_pricelist=source.purchase_pricelist,
            source_document=source,
            notes=source.notes,
            created_by=getattr(request.user, "identity", None),
        )
        copy_lines(source, delivery_note)
        return Response(InventoryDocumentSerializer(delivery_note).data, status=status.HTTP_201_CREATED)


class InventoryDocumentReceiveView(APIView):
    permission_classes = [IsPosManager]

    @transaction.atomic
    def post(self, request, pk):
        source = get_object_or_404(InventoryDocument.objects.prefetch_related("lines", "lines__product"), pk=pk)
        if source.document_type not in [
            InventoryDocument.DocumentType.GOODS_DELIVERY_NOTE,
            InventoryDocument.DocumentType.REQUISITION,
        ]:
            return Response({"detail": "Receive goods from a delivery note or requisition."}, status=status.HTTP_400_BAD_REQUEST)
        if source.status == InventoryDocument.Status.RECEIVED:
            return Response({"detail": "This document has already been received."}, status=status.HTTP_400_BAD_REQUEST)

        goods_received = InventoryDocument.objects.create(
            document_type=InventoryDocument.DocumentType.GOODS_RECEIVED_NOTE,
            status=InventoryDocument.Status.RECEIVED,
            supplier_name=source.supplier_name,
            purchase_pricelist=source.purchase_pricelist,
            source_document=source,
            notes=request.data.get("notes", source.notes),
            created_by=getattr(request.user, "identity", None),
            received_at=timezone.now(),
        )
        copy_lines(source, goods_received, received=True)

        for line in goods_received.lines.select_related("product").all():
            Product.objects.filter(pk=line.product_id).update(
                quantity=F("quantity") + line.received_quantity,
                is_inventory_tracked=True,
            )
            StockMovement.objects.create(
                product=line.product,
                document=goods_received,
                movement_type=StockMovement.MovementType.IN,
                quantity=line.received_quantity,
                notes=f"Received through {goods_received.document_number}",
            )

        source.status = InventoryDocument.Status.RECEIVED
        source.received_at = goods_received.received_at
        source.save(update_fields=["status", "received_at", "updated_at"])
        return Response(InventoryDocumentSerializer(goods_received).data, status=status.HTTP_201_CREATED)


class StockMovementListView(APIView):
    permission_classes = [IsPosManager]

    def get(self, request):
        queryset = StockMovement.objects.select_related("product", "document")
        return paginated_response(request, queryset, StockMovementSerializer)
