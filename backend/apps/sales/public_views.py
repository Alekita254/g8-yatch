from decimal import Decimal

from django.db import models, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product, SalesPricelist, SalesPricelistItem
from apps.users.models import ServicePoint

from .models import GuestVisit, SalesOrder, SalesOrderItem
from .serializers import GuestVisitSerializer
from .views import create_invoice_from_order, next_number


def visit_queryset():
    return GuestVisit.objects.select_related("service_point").prefetch_related(
        "orders__items__product",
        "orders__invoice__payments",
    )


def visit_response(visit):
    data = GuestVisitSerializer(visit_queryset().get(pk=visit.pk)).data
    data.pop("public_token", None)
    return data


class PublicMenuView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        code = request.query_params.get("pricelist", "standard-menu")
        pricelist = (
            SalesPricelist.objects.filter(code=code, is_active=True)
            .prefetch_related("items__product__category")
            .first()
            or SalesPricelist.objects.filter(is_active=True)
            .prefetch_related("items__product__category")
            .first()
        )
        if not pricelist:
            return Response([])
        return Response([
            {
                "id": item.product_id,
                "name": item.product.name,
                "description": item.product.description,
                "price": item.price,
                "currency": item.currency,
                "category": item.product.category.name,
            }
            for item in pricelist.items.all()
            if item.product.is_active and item.product.is_sellable
        ])


class PublicVisitStartView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        service_area = str(request.data.get("service_area", "")).strip()
        table_name = str(request.data.get("table_name", "")).strip()
        if not service_area or not table_name:
            return Response(
                {"detail": "Service area and table or seating number are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        point_kind = ServicePoint.Kind.BAR if "bar" in service_area.lower() else ServicePoint.Kind.RESTAURANT
        service_point = ServicePoint.objects.filter(kind=point_kind, is_active=True).first()
        visit = GuestVisit.objects.create(
            visit_number=next_number("VIS", GuestVisit, "visit_number"),
            service_point=service_point,
            service_area=service_area,
            table_name=table_name,
            guest_name=str(request.data.get("guest_name", "")).strip(),
            phone=str(request.data.get("phone", "")).strip(),
        )
        return Response(
            {"token": visit.public_token, **visit_response(visit)},
            status=status.HTTP_201_CREATED,
        )


class PublicVisitDetailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, token):
        return Response(visit_response(get_object_or_404(GuestVisit, public_token=token)))


class PublicVisitOrderView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request, token):
        visit = get_object_or_404(GuestVisit, public_token=token)
        if visit.status != GuestVisit.Status.ACTIVE:
            return Response(
                {
                    "detail": "This visit is no longer open for orders.",
                    "visit_status": visit.status,
                },
                status=status.HTTP_409_CONFLICT,
            )
        requested_items = request.data.get("items") or []
        if not requested_items:
            return Response({"detail": "Add at least one menu item."}, status=status.HTTP_400_BAD_REQUEST)

        product_ids = [item.get("product_id") for item in requested_items]
        products = Product.objects.filter(id__in=product_ids, is_active=True, is_sellable=True)
        product_map = {product.id: product for product in products}
        price_map = {
            item.product_id: item.price
            for item in SalesPricelistItem.objects.filter(
                pricelist__is_active=True,
                product_id__in=product_ids,
            ).order_by("pricelist_id")
        }
        preferred_prices = SalesPricelistItem.objects.filter(
            pricelist__is_active=True,
            product_id__in=product_ids,
        ).filter(
            models.Q(pricelist__service_point=visit.service_point)
            | models.Q(pricelist__service_points=visit.service_point)
            | models.Q(pricelist__service_point_kind=visit.service_point.kind if visit.service_point else "")
        )
        price_map.update({item.product_id: item.price for item in preferred_prices})
        lines = []
        subtotal = Decimal("0")
        for requested in requested_items:
            product_id = requested.get("product_id")
            product = product_map.get(product_id)
            price = price_map.get(product_id)
            try:
                quantity = Decimal(str(requested.get("quantity", 0)))
            except (ArithmeticError, ValueError):
                quantity = Decimal("0")
            if not product or price is None or quantity <= 0:
                raise serializers.ValidationError({"items": "One or more menu items are unavailable."})
            line_total = price * quantity
            subtotal += line_total
            lines.append((product, quantity, price, line_total))

        order = SalesOrder.objects.create(
            order_number=next_number("WEB", SalesOrder, "order_number"),
            visit=visit,
            service_point=visit.service_point,
            table_name=f"{visit.service_area} {visit.table_name}".strip(),
            customer_name=visit.guest_name or "Walk-in guest",
            status=SalesOrder.Status.SENT,
            subtotal=subtotal,
            grand_total=subtotal,
            notes=str(request.data.get("notes", "")).strip(),
        )
        SalesOrderItem.objects.bulk_create([
            SalesOrderItem(
                order=order,
                product=product,
                service_point=visit.service_point,
                quantity=quantity,
                unit_price=price,
                line_total=line_total,
                status=SalesOrderItem.Status.SENT_TO_KITCHEN,
                routed_station=product.category.route_station,
                sent_at=timezone.now(),
            )
            for product, quantity, price, line_total in lines
        ])
        return Response(visit_response(visit), status=status.HTTP_201_CREATED)


class PublicVisitWaiterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, token):
        visit = get_object_or_404(GuestVisit, public_token=token, status=GuestVisit.Status.ACTIVE)
        visit.waiter_requested_at = timezone.now()
        visit.waiter_acknowledged_at = None
        visit.waiter_keycloak_sub = ""
        visit.save(update_fields=["waiter_requested_at", "waiter_acknowledged_at", "updated_at"])
        return Response(visit_response(visit))


class PublicVisitCheckoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @transaction.atomic
    def post(self, request, token):
        visit = get_object_or_404(GuestVisit, public_token=token)
        if visit.status == GuestVisit.Status.CLOSED:
            return Response({"detail": "This visit is already paid and closed."}, status=status.HTTP_400_BAD_REQUEST)
        for order in visit.orders.exclude(status=SalesOrder.Status.CANCELLED):
            if not hasattr(order, "invoice"):
                create_invoice_from_order(order)
        visit.status = GuestVisit.Status.CHECKOUT_REQUESTED
        visit.checkout_requested_at = timezone.now()
        visit.save(update_fields=["status", "checkout_requested_at", "updated_at"])
        return Response(visit_response(visit))


class PublicVisitFeedbackView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, token):
        visit = get_object_or_404(GuestVisit, public_token=token)
        try:
            rating = int(request.data.get("rating"))
        except (TypeError, ValueError):
            rating = 0
        if rating not in range(1, 6):
            return Response({"detail": "Rating must be between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)
        visit.feedback_rating = rating
        visit.feedback_comment = str(request.data.get("comment", "")).strip()
        visit.save(update_fields=["feedback_rating", "feedback_comment", "updated_at"])
        return Response(visit_response(visit))
