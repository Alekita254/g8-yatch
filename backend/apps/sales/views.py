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
from apps.products.models import Product

from .models import CustomerPaymentRun, CustomerPaymentRunAllocation, GuestVisit, SalesInvoice, SalesOrder, SalesOrderItem, SalesPayment
from .serializers import CustomerPaymentRunSerializer, GuestVisitSerializer, SalesInvoiceDetailSerializer, SalesInvoiceSerializer, SalesOrderItemSerializer, SalesOrderSerializer, SalesPaymentDetailSerializer, SalesPaymentSerializer
from .taxing import calculate_order_tax_lines, inclusive_tax_breakdown, money, tax_lines_from_payload


def next_number(prefix, model, field):
    count = model.objects.count() + 1
    return f"{prefix}-{timezone.now():%Y%m%d}-{count:05d}"


def build_fiscal_payload(order):
    item_source = order.items.exclude(status=SalesOrderItem.Status.VOIDED)
    try:
        items = list(item_source.select_related("product", "product__category"))
    except TypeError:
        item_values = item_source.values("product_id", "quantity", "unit_price", "line_total")
        return {
            "order_number": order.order_number,
            "items": [
                {
                    "product_id": item["product_id"],
                    "quantity": str(item["quantity"]),
                    "unit_price": str(item["unit_price"]),
                    "line_total": str(item["line_total"]),
                }
                for item in item_values
            ],
        }
    line_bases = [
        {
            "base": money(item.quantity * item.unit_price),
            "vat_rate": item.product.category.tax_rate if item.product.category_id else Decimal("16.00"),
        }
        for item in items
    ]
    taxes = calculate_order_tax_lines(line_bases)
    return {
        "order_number": order.order_number,
        "tax_lines": taxes["tax_lines"],
        "items": [
            {
                "product_id": item.product_id,
                "quantity": str(item.quantity),
                "unit_price": str(item.unit_price),
                "line_total": str(item.line_total),
            }
            for item in items
        ],
    }


def apply_sales_taxes_to_order_data(data):
    items = data.get("items") or []
    product_ids = [int(item.get("product")) for item in items if item.get("product")]
    products = {
        product.id: product
        for product in Product.objects.select_related("category").filter(id__in=product_ids)
    }
    line_bases = []
    normalized_items = []

    for item in items:
        product = products.get(int(item.get("product"))) if item.get("product") else None
        quantity = Decimal(str(item.get("quantity") or "0"))
        unit_price = money(item.get("unit_price") or "0")
        base = money(quantity * unit_price)
        vat_rate = product.category.tax_rate if product and product.category_id else Decimal("16.00")
        line_bases.append({"base": base, "vat_rate": vat_rate})
        normalized_items.append((item, base, vat_rate))

    taxes = calculate_order_tax_lines(line_bases)
    for item, base, vat_rate in normalized_items:
        item_tax = inclusive_tax_breakdown(base, vat_rate, taxes["tot_rate"])["tax"]
        item["tax_total"] = str(item_tax)
        item["discount_total"] = str(money(item.get("discount_total") or "0"))
        item["line_total"] = str(money(base - Decimal(item["discount_total"])))

    discount_total = money(sum((Decimal(str(item.get("discount_total") or "0")) for item in items), Decimal("0")))
    data["items"] = items
    data["subtotal"] = str(taxes["subtotal"])
    data["tax_total"] = str(taxes["tax_total"])
    data["discount_total"] = str(discount_total)
    data["grand_total"] = str(money(taxes["gross_total"] - discount_total))
    return data


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


MPESA_TILL_NUMBER = "5869651"


def draw_till_block(c, *, y, margin, right, center, line_height, mm):
    block_top = y + 1.4 * mm
    block_bottom = y - 11 * mm
    c.setLineWidth(1.2)
    c.roundRect(margin, block_bottom, right - margin, block_top - block_bottom, 2 * mm, stroke=1, fill=0)
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(center, y - 2.4 * mm, "M-PESA TILL")
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(center, y - 8.6 * mm, MPESA_TILL_NUMBER)
    return block_bottom - 3 * mm


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
    content_lines = 32 + len(items) + max(len(payments), 1)
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

    centered("G8 YACHT VILLA", "Helvetica-Bold", 13)
    centered("Embu, Kenya", "Helvetica", 8)
    centered("PAYMENT RECEIPT" if payments else "UNPAID BILL", "Helvetica-Bold", 10)
    centered("PAID" if invoice.balance_due <= 0 and payments else invoice.status.replace("_", " "), "Helvetica-Bold", 9)
    y = draw_till_block(c, y=y, margin=margin, right=right, center=center, line_height=line_height, mm=mm)
    rule()

    pair("Receipt", receipt_number)
    pair("Date", timezone.localtime(receipt_time).strftime("%d %b %Y  %H:%M"))
    pair("Invoice", invoice.invoice_number)
    pair("Order", invoice.order.order_number)
    if invoice.branch:
        pair("Branch", invoice.branch.name[:24])
    rule()

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "ITEM")
    c.drawRightString(42 * mm, y, "QTY")
    c.drawRightString(59 * mm, y, "PRICE")
    c.drawRightString(right, y, "AMOUNT")
    y -= line_height
    for item in items:
        quantity = f"{item.quantity:g}"
        c.setFont("Helvetica", 8)
        c.drawString(margin, y, str(item.product.name)[:17])
        c.drawRightString(42 * mm, y, quantity)
        c.drawRightString(59 * mm, y, f"{item.unit_price:,.2f}")
        c.drawRightString(right, y, f"{item.line_total:,.2f}")
        y -= line_height

    rule()
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "BILL SUMMARY")
    y -= line_height
    for tax in tax_lines_from_payload(invoice.fiscal_payload):
        pair(f"{tax.get('name', 'Tax')} {tax.get('rate', '')}%", f"KES {Decimal(str(tax.get('amount', '0'))):,.2f}")
    pair("Tax total", f"KES {invoice.tax_total:,.2f}")
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


def generate_sales_invoice_pdf(invoice):
    from io import BytesIO
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    items = list(
        invoice.order.items.exclude(status=SalesOrderItem.Status.VOIDED).select_related("product")
    )
    page_width = 80 * mm
    content_lines = 29 + len(items)
    page_height = max(135 * mm, (content_lines * 4.7 + 18) * mm)
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

    centered("G8 YACHT VILLA", "Helvetica-Bold", 13)
    centered("Embu, Kenya", "Helvetica", 8)
    centered("SALES INVOICE", "Helvetica-Bold", 10)
    centered(invoice.status.replace("_", " "), "Helvetica-Bold", 9)
    y = draw_till_block(c, y=y, margin=margin, right=right, center=center, line_height=line_height, mm=mm)
    rule()

    pair("Invoice", invoice.invoice_number)
    pair("Date", timezone.localtime(invoice.created_at).strftime("%d %b %Y  %H:%M"))
    pair("Order", invoice.order.order_number)
    if invoice.branch:
        pair("Branch", invoice.branch.name[:24])
    if invoice.issued_by:
        pair("Issued by", staff_display_name(invoice.issued_by)[:24])
    rule()

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "ITEM")
    c.drawRightString(42 * mm, y, "QTY")
    c.drawRightString(59 * mm, y, "PRICE")
    c.drawRightString(right, y, "AMOUNT")
    y -= line_height
    for item in items:
        quantity = f"{item.quantity:g}"
        c.setFont("Helvetica", 8)
        c.drawString(margin, y, str(item.product.name)[:17])
        c.drawRightString(42 * mm, y, quantity)
        c.drawRightString(59 * mm, y, f"{item.unit_price:,.2f}")
        c.drawRightString(right, y, f"{item.line_total:,.2f}")
        y -= line_height

    rule()
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "BILL SUMMARY")
    y -= line_height
    for tax in tax_lines_from_payload(invoice.fiscal_payload):
        pair(f"{tax.get('name', 'Tax')} {tax.get('rate', '')}%", f"KES {Decimal(str(tax.get('amount', '0'))):,.2f}")
    pair("Tax total", f"KES {invoice.tax_total:,.2f}")
    pair("Discount", f"- KES {invoice.discount_total:,.2f}")
    pair("INVOICE TOTAL", f"KES {invoice.grand_total:,.2f}", "Helvetica-Bold", 10)
    pair("Amount paid", f"KES {invoice.paid_total:,.2f}", "Helvetica", 8)
    pair("Balance due", f"KES {invoice.balance_due:,.2f}", "Helvetica-Bold", 9)
    rule()

    centered("This is the sales invoice for billed goods and services.", "Helvetica", 7)
    centered("Payment receipts are issued separately when payment is collected.", "Helvetica", 7)
    c.save()
    buffer.seek(0)
    return buffer


def generate_visit_invoice_pdf(visit, *, receipt=False):
    from io import BytesIO
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    invoices = [
        order.invoice
        for order in visit.orders.exclude(status=SalesOrder.Status.CANCELLED).select_related("invoice", "branch")
        if hasattr(order, "invoice")
    ]
    items = list(
        SalesOrderItem.objects.filter(order__visit=visit)
        .exclude(status=SalesOrderItem.Status.VOIDED)
        .select_related("product", "order")
        .order_by("order__created_at", "created_at")
    )
    payments = list(
        SalesPayment.objects.filter(invoice__in=invoices, status=SalesPayment.Status.CLEARED)
        .select_related("payment_method", "invoice")
        .order_by("created_at")
    )
    subtotal = sum((invoice.subtotal for invoice in invoices), Decimal("0"))
    tax_total = sum((invoice.tax_total for invoice in invoices), Decimal("0"))
    discount_total = sum((invoice.discount_total for invoice in invoices), Decimal("0"))
    grand_total = sum((invoice.grand_total for invoice in invoices), Decimal("0"))
    paid_total = sum((invoice.paid_total for invoice in invoices), Decimal("0"))
    balance_due = sum((invoice.balance_due for invoice in invoices), Decimal("0"))
    tax_totals = {}
    for invoice in invoices:
        for tax in tax_lines_from_payload(invoice.fiscal_payload):
            key = (tax.get("code") or tax.get("name") or "Tax", tax.get("name") or "Tax", tax.get("rate") or "")
            tax_totals[key] = tax_totals.get(key, Decimal("0")) + Decimal(str(tax.get("amount", "0")))

    content_lines = 18 + len(items) + len(invoices) + len(payments) + len(tax_totals)
    page_width = 80 * mm
    page_height = max(165 * mm, (content_lines * 4.8 + 26) * mm)
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
        c.drawString(margin, y, str(label)[:25])
        c.drawRightString(right, y, str(value))
        y -= line_height

    def rule():
        nonlocal y
        y -= 1 * mm
        c.setDash(1, 2)
        c.line(margin, y, right, y)
        c.setDash()
        y -= 3.5 * mm

    centered("G8 YACHT VILLA", "Helvetica-Bold", 13)
    centered("COMBINED PAYMENT RECEIPT" if receipt else "COMBINED VISIT INVOICE", "Helvetica-Bold", 10)
    centered(visit.visit_number, "Helvetica-Bold", 9)
    y = draw_till_block(c, y=y, margin=margin, right=right, center=center, line_height=line_height, mm=mm)
    rule()

    pair("Date", timezone.localtime(timezone.now()).strftime("%d %b %Y  %H:%M"))
    pair("Guest", visit.guest_name or "Walk-in guest")
    pair("Visit", f"{visit.service_area} {visit.table_name}".strip())
    pair("Invoices", str(len(invoices)))
    rule()

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "ITEM")
    c.drawRightString(42 * mm, y, "QTY")
    c.drawRightString(59 * mm, y, "PRICE")
    c.drawRightString(right, y, "AMOUNT")
    y -= line_height
    for item in items:
        c.setFont("Helvetica", 8)
        c.drawString(margin, y, str(item.product.name)[:17])
        c.drawRightString(42 * mm, y, f"{item.quantity:g}")
        c.drawRightString(59 * mm, y, f"{item.unit_price:,.2f}")
        c.drawRightString(right, y, f"{item.line_total:,.2f}")
        y -= line_height

    rule()
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "BILL SUMMARY")
    y -= line_height
    for (_, name, rate), amount in tax_totals.items():
        pair(f"{name} {rate}%", f"KES {amount:,.2f}")
    pair("Tax total", f"KES {tax_total:,.2f}")
    pair("Discount", f"- KES {discount_total:,.2f}")
    pair("TOTAL", f"KES {grand_total:,.2f}", "Helvetica-Bold", 10)
    rule()

    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, y, "INVOICES")
    c.drawRightString(right, y, "TOTAL")
    y -= line_height
    for invoice in invoices:
        c.setFont("Helvetica", 8)
        c.drawString(margin, y, invoice.invoice_number[:24])
        c.drawRightString(right, y, f"{invoice.grand_total:,.2f}")
        y -= line_height

    if receipt:
        rule()
        c.setFont("Helvetica-Bold", 8)
        c.drawString(margin, y, "PAYMENTS")
        c.drawRightString(right, y, "AMOUNT")
        y -= line_height
        for payment in payments:
            reference = f" ({payment.reference})" if payment.reference else ""
            c.setFont("Helvetica", 8)
            c.drawString(margin, y, f"{payment.payment_method.name}{reference}"[:31])
            c.drawRightString(right, y, f"{payment.amount:,.2f}")
            y -= line_height

    rule()
    pair("AMOUNT PAID", f"KES {paid_total:,.2f}", "Helvetica-Bold", 10)
    pair("BALANCE", f"KES {balance_due:,.2f}", "Helvetica-Bold", 9)
    rule()
    centered("Thank you for visiting G8 Yacht Villa.", "Helvetica", 7)

    c.save()
    buffer.seek(0)
    return buffer


def generate_order_receipts_pdf(order):
    from io import BytesIO
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    items = list(
        order.items.exclude(status=SalesOrderItem.Status.VOIDED).select_related(
            "product",
            "product__category",
            "service_point",
        )
    )
    bar_markers = ("bar",)

    def is_bar_item(item):
        category = item.product.category
        category_text = " ".join(
            [
                category.name if category else "",
                category.ui_tab if category else "",
                category.route_station if category else "",
                item.routed_station or "",
            ]
        ).lower()
        return (
            item.service_point
            and item.service_point.kind == ServicePoint.Kind.BAR
        ) or any(marker in category_text for marker in bar_markers)

    bar_items = [item for item in items if is_bar_item(item)]
    chef_items = [item for item in items if not is_bar_item(item)]
    page_width = 80 * mm
    copy_lines = 25 + (len(items) * 2)
    page_height = max(115 * mm, (copy_lines * 4.7 + 18) * mm)
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(page_width, page_height))
    margin = 6 * mm
    right = page_width - margin
    center = page_width / 2
    line_height = 4.6 * mm

    def draw_copy(copy_label, copy_items):
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

        centered("G8 YACHT VILLA", "Helvetica-Bold", 13)
        centered("ORDER RECEIPT", "Helvetica-Bold", 10)
        centered(copy_label, "Helvetica-Bold", 10)
        if copy_label == "CUSTOMER COPY":
            y = draw_till_block(c, y=y, margin=margin, right=right, center=center, line_height=line_height, mm=mm)
        rule()

        pair("Order", order.order_number)
        pair("Date", timezone.localtime(order.created_at).strftime("%d %b %Y  %H:%M"))
        if order.waiter_keycloak_sub:
            pair("Served by", staff_display_name(order.waiter_keycloak_sub)[:24])
        rule()

        c.setFont("Helvetica-Bold", 8)
        c.drawString(margin, y, "ITEM")
        c.drawRightString(42 * mm, y, "QTY")
        c.drawRightString(59 * mm, y, "PRICE")
        c.drawRightString(right, y, "AMOUNT")
        y -= line_height
        for item in copy_items:
            quantity = f"{item.quantity:g}"
            c.setFont("Helvetica", 8)
            c.drawString(margin, y, str(item.product.name)[:17])
            c.drawRightString(42 * mm, y, quantity)
            c.drawRightString(59 * mm, y, f"{item.unit_price:,.2f}")
            c.drawRightString(right, y, f"{item.line_total:,.2f}")
            y -= line_height

        if order.notes:
            rule()
            c.setFont("Helvetica-Bold", 8)
            c.drawString(margin, y, "NOTES")
            y -= line_height
            c.setFont("Helvetica", 8)
            c.drawString(margin, y, order.notes[:38])
            y -= line_height

        if copy_label == "CUSTOMER COPY":
            rule()
            c.setFont("Helvetica-Bold", 8)
            c.drawString(margin, y, "BILL SUMMARY")
            y -= line_height
            for tax in build_fiscal_payload(order).get("tax_lines", []):
                pair(f"{tax.get('name', 'Tax')} {tax.get('rate', '')}%", f"KES {Decimal(str(tax.get('amount', '0'))):,.2f}")
            pair("Tax total", f"KES {order.tax_total:,.2f}")
            pair("Discount", f"- KES {order.discount_total:,.2f}")
            pair("ORDER TOTAL", f"KES {order.grand_total:,.2f}", "Helvetica-Bold", 10)
        else:
            rule()
            centered("Prepare this order for the guest.", "Helvetica-Bold", 8)

    copies = []
    if chef_items:
        copies.append(("CHEF COPY", chef_items))
    if bar_items:
        copies.append(("BAR COPY", bar_items))
    copies.append(("CUSTOMER COPY", items))

    for index, (label, copy_items) in enumerate(copies):
        if index:
            c.showPage()
        draw_copy(label, copy_items)

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


def create_invoice_from_order(order, issued_by=""):
    if hasattr(order, "invoice"):
        invoice = order.invoice
        if issued_by and not invoice.issued_by:
            invoice.issued_by = issued_by
            invoice.save(update_fields=["issued_by"])
        return invoice

    create_kwargs = {}
    if issued_by:
        create_kwargs["issued_by"] = issued_by

    fiscal_payload = build_fiscal_payload(order)
    return SalesInvoice.objects.create(
        invoice_number=next_number("INV", SalesInvoice, "invoice_number"),
        order=order,
        branch=order.branch,
        customer_name=order.customer_name,
        subtotal=order.subtotal,
        tax_total=order.tax_total,
        discount_total=order.discount_total,
        grand_total=order.grand_total,
        balance_due=order.grand_total,
        fiscal_payload=fiscal_payload,
        **create_kwargs,
    )


def create_invoice_from_order_with_issuer(order, issued_by=''):
    return create_invoice_from_order(order, issued_by=issued_by)


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
        if data.get("visit"):
            visit = get_object_or_404(GuestVisit, pk=data["visit"])
            if visit.status != GuestVisit.Status.ACTIVE:
                return Response({"detail": "This visit is not open for new items."}, status=status.HTTP_400_BAD_REQUEST)
            data["table_name"] = data.get("table_name") or visit.table_name
            data["customer_name"] = data.get("customer_name") or visit.guest_name
        elif data.get("service_point") and str(data.get("table_name", "")).strip():
            service_point = get_object_or_404(ServicePoint, pk=data["service_point"])
            visit = find_or_create_visit(
                service_point=service_point,
                table_name=str(data.get("table_name", "")),
                customer_name=str(data.get("customer_name", "")).strip(),
            )
            data["visit"] = visit.pk
        data = apply_sales_taxes_to_order_data(data)
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
        if hasattr(order, "invoice"):
            return Response({"detail": "Orders with issued invoices are locked."}, status=status.HTTP_400_BAD_REQUEST)
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
        create_invoice_from_order(order)
        order = SalesOrder.objects.select_related("invoice").get(pk=order.pk)
        return Response(SalesOrderSerializer(order).data)


class SalesOrderReceiptsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_object_or_404(
            SalesOrder.objects.select_related(
                "branch",
                "service_point",
                "visit",
            ).prefetch_related(
                "items__product",
                "items__service_point",
            ),
            pk=pk,
        )
        try:
            document = generate_order_receipts_pdf(order)
            return FileResponse(
                document,
                content_type="application/pdf",
                filename=f"order-receipts-{order.order_number}.pdf",
            )
        except Exception:
            return Response({"detail": "Failed to generate order receipts."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


class GuestVisitInvoiceDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        visit = get_object_or_404(
            GuestVisit.objects.prefetch_related(
                "orders__invoice__payments",
                "orders__items__product",
            ),
            pk=pk,
        )
        if not any(hasattr(order, "invoice") for order in visit.orders.exclude(status=SalesOrder.Status.CANCELLED)):
            return Response({"detail": "No invoices are available for this visit yet."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            document = generate_visit_invoice_pdf(visit, receipt=False)
            return FileResponse(
                document,
                content_type="application/pdf",
                filename=f"visit-invoice-{visit.visit_number}.pdf",
            )
        except Exception:
            return Response({"detail": "Failed to generate combined visit invoice."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GuestVisitReceiptDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        visit = get_object_or_404(
            GuestVisit.objects.prefetch_related(
                "orders__invoice__payments",
                "orders__items__product",
            ),
            pk=pk,
        )
        if not SalesPayment.objects.filter(invoice__order__visit=visit, status=SalesPayment.Status.CLEARED).exists():
            return Response({"detail": "No payment receipt is available until payment is collected."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            document = generate_visit_invoice_pdf(visit, receipt=True)
            return FileResponse(
                document,
                content_type="application/pdf",
                filename=f"visit-receipt-{visit.visit_number}.pdf",
            )
        except Exception:
            return Response({"detail": "Failed to generate combined visit receipt."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SalesOrderStatusView(APIView):
    permission_classes = [IsAuthenticated]
    transitions = {
        SalesOrder.Status.SENT: {SalesOrder.Status.SERVED, SalesOrder.Status.CANCELLED},
        SalesOrder.Status.PREPARING: {SalesOrder.Status.SERVED, SalesOrder.Status.CANCELLED},
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
            uninvoiced = visit.orders.exclude(status=SalesOrder.Status.CANCELLED).filter(invoice__isnull=True).exists()
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
        if not invoice.payments.filter(status=SalesPayment.Status.CLEARED).exists():
            return Response({"detail": "No payment receipt is available until payment is collected."}, status=status.HTTP_400_BAD_REQUEST)
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


class SalesInvoiceDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        invoice = get_object_or_404(
            SalesInvoice.objects.select_related(
                "branch",
                "order",
                "order__visit",
            ).prefetch_related(
                "order__items__product",
            ),
            pk=pk,
        )
        try:
            document = generate_sales_invoice_pdf(invoice)
            return FileResponse(
                document,
                content_type="application/pdf",
                filename=f"invoice-{invoice.invoice_number}.pdf",
            )
        except Exception:
            return Response({"detail": "Failed to generate invoice."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
