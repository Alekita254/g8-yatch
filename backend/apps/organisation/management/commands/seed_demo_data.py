from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.business_partners.models import BusinessPartner
from apps.concierge.models import ServiceRequest
from apps.folios.models import Folio, FolioLine
from apps.organisation.models import Branch, Organization
from apps.payments.models import PaymentMethod
from apps.products.models import (
    Product,
    ProductCategory,
    SalesPricelist,
    SalesPricelistItem,
)
from apps.reservations.models import Reservation
from apps.rooms.models import Room, RoomType
from apps.sales.models import (
    CustomerPaymentRun,
    CustomerPaymentRunAllocation,
    SalesInvoice,
    SalesOrder,
    SalesOrderItem,
    SalesPayment,
)
from apps.users.models import ServicePoint, UserIdentity


class Command(BaseCommand):
    help = "Create or refresh a connected G8 Yacht Villa demo dataset."

    @transaction.atomic
    def handle(self, *args, **options):
        today = timezone.localdate()
        now = timezone.now()

        organization, _ = Organization.objects.update_or_create(
            code="g8-yacht-villa",
            defaults={
                "name": "G8 Yacht Villa",
                "legal_name": "G8 Yacht Villa Limited",
                "taxpayer_pin": "P051234567Q",
                "business_email": "reservations@g8yachtvilla.co.ke",
                "business_phone": "+254 709 888 000",
                "physical_address": "Lake Naivasha, Moi South Lake Road, Kenya",
                "is_active": True,
            },
        )
        naivasha, _ = Branch.objects.update_or_create(
            code="naivasha",
            defaults={
                "organization": organization,
                "name": "G8 Yacht Villa Naivasha",
                "branch_type": "LAKESIDE_RESORT",
                "location": "Moi South Lake Road, Naivasha",
                "kra_pin": "P051234567Q",
                "phone": "+254 709 888 001",
                "email": "naivasha@g8yachtvilla.co.ke",
                "is_headquarters": True,
                "is_active": True,
            },
        )

        service_points = {}
        for code, name, kind, location in [
            ("main-frontdesk", "Main Frontdesk", "FRONTDESK", "Villa reception"),
            ("restaurant-pos", "Lakeside Restaurant", "RESTAURANT", "Main dining terrace"),
            ("pool-bar-pos", "Infinity Pool Bar", "BAR", "Pool deck"),
            ("marina-desk", "Marina Experiences", "MARINA", "Private jetty"),
        ]:
            service_points[code], _ = ServicePoint.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "kind": kind,
                    "location": location,
                    "description": f"Operational service point for {name.lower()}.",
                    "is_active": True,
                },
            )

        room_types = {}
        for code, name, base, maximum, description in [
            ("garden-suite", "Garden Suite", 2, 3, "Quiet suite opening onto tropical gardens."),
            ("lake-suite", "Lake View Suite", 2, 3, "Upper-floor suite with uninterrupted lake views."),
            ("family-villa", "Family Villa", 4, 6, "Two-bedroom villa with a private lounge."),
            ("marina-penthouse", "Marina Penthouse", 2, 4, "Signature penthouse overlooking the jetty."),
        ]:
            room_types[code], _ = RoomType.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "base_occupancy": base,
                    "max_occupancy": maximum,
                    "description": description,
                    "is_active": True,
                },
            )

        rooms = {}
        room_rows = [
            ("G01", "garden-suite", "Ground", "AVAILABLE"),
            ("G02", "garden-suite", "Ground", "DIRTY"),
            ("L11", "lake-suite", "First", "OCCUPIED"),
            ("L12", "lake-suite", "First", "AVAILABLE"),
            ("L21", "lake-suite", "Second", "OCCUPIED"),
            ("L22", "lake-suite", "Second", "MAINTENANCE_BLOCK"),
            ("V01", "family-villa", "Garden Wing", "OCCUPIED"),
            ("V02", "family-villa", "Garden Wing", "AVAILABLE"),
            ("P01", "marina-penthouse", "Penthouse", "OCCUPIED"),
            ("P02", "marina-penthouse", "Penthouse", "AVAILABLE"),
        ]
        for number, room_type, floor, status in room_rows:
            rooms[number], _ = Room.objects.update_or_create(
                number=number,
                defaults={
                    "branch": naivasha,
                    "room_type": room_types[room_type],
                    "floor": floor,
                    "status": status,
                    "is_active": True,
                },
            )

        partners = {}
        partner_rows = [
            ("amina-hassan", "GUEST", "Amina Hassan", "amina.hassan@example.com", "+254 722 410 118", "Kenyan", True, "75000"),
            ("daniel-okello", "GUEST", "Daniel Okello", "daniel.okello@example.com", "+254 710 884 231", "Ugandan", True, "50000"),
            ("sophia-martin", "GUEST", "Sophia Martin", "sophia.martin@example.com", "+44 7700 900 312", "British", True, "120000"),
            ("kwame-mensah", "GUEST", "Kwame Mensah", "kwame.mensah@example.com", "+233 244 555 913", "Ghanaian", False, "0"),
            ("neema-mwangi", "GUEST", "Neema Mwangi", "neema.mwangi@example.com", "+254 733 608 742", "Kenyan", True, "60000"),
            ("acacia-travel", "TRAVEL_AGENT", "Acacia Africa Travel", "bookings@acacia-africa.example", "+254 709 302 100", "Kenyan", True, "350000"),
            ("savannah-holdings", "CORPORATE", "Savannah Holdings Ltd", "travel@savannah.example", "+254 711 900 200", "Kenyan", True, "500000"),
            ("lake-fresh-supplies", "SUPPLIER", "Lake Fresh Supplies", "orders@lakefresh.example", "+254 720 331 800", "Kenyan", False, "0"),
        ]
        for code, partner_type, name, email, phone, nationality, room_charge, credit_limit in partner_rows:
            partners[code], _ = BusinessPartner.objects.update_or_create(
                code=code,
                defaults={
                    "partner_type": partner_type,
                    "display_name": name,
                    "email": email,
                    "phone": phone,
                    "nationality": nationality,
                    "id_document_type": "Passport" if nationality != "Kenyan" else "National ID",
                    "id_document_number": f"DEMO-{code.upper()[:12]}",
                    "can_charge_to_room": room_charge,
                    "credit_limit": Decimal(credit_limit),
                    "is_active": True,
                },
            )

        reservations = {}
        reservation_rows = [
            ("DEMO-RES-001", "amina-hassan", "L11", -1, 2, 2, 0, "CHECKED_IN", "Direct Website", "WEB-24031"),
            ("DEMO-RES-002", "daniel-okello", "L21", -2, 1, 1, 0, "CHECKED_IN", "Booking.com", "BDC-88314"),
            ("DEMO-RES-003", "sophia-martin", "P01", 0, 4, 2, 1, "CHECKED_IN", "Acacia Africa Travel", "AAT-19028"),
            ("DEMO-RES-004", "neema-mwangi", "V01", -1, 3, 4, 1, "CHECKED_IN", "Corporate", "SHL-44302"),
            ("DEMO-RES-005", "kwame-mensah", "L12", 2, 5, 2, 0, "CONFIRMED", "Expedia", "EXP-50812"),
            ("DEMO-RES-006", "acacia-travel", "V02", 5, 8, 4, 2, "TENTATIVE", "Travel Agent", "AAT-GROUP-77"),
            ("DEMO-RES-007", "savannah-holdings", "G01", -8, -5, 1, 0, "CHECKED_OUT", "Corporate", "SHL-43882"),
        ]
        for number, partner, room, check_in, check_out, adults, children, status, source, reference in reservation_rows:
            reservations[number], _ = Reservation.objects.update_or_create(
                reservation_number=number,
                defaults={
                    "business_partner": partners[partner],
                    "room": rooms[room],
                    "check_in_date": today + timedelta(days=check_in),
                    "check_out_date": today + timedelta(days=check_out),
                    "adults": adults,
                    "children": children,
                    "status": status,
                    "source": source,
                    "channel_reference": reference,
                    "deposit_due_at": now + timedelta(days=max(check_in - 1, 0)),
                    "notes": "Demo reservation created to showcase the live frontdesk workflow.",
                },
            )

        folio_specs = [
            ("DEMO-FOL-001", "DEMO-RES-001", "OPEN", [
                ("ROOM_CHARGE", "Lake View Suite - nightly rate", "18500", "ROOM-1"),
                ("POS_CHARGE", "Lakeside restaurant dinner", "6200", "POS-1001"),
                ("PAYMENT", "M-Pesa deposit", "15000", "QH71DEMO01"),
            ]),
            ("DEMO-FOL-002", "DEMO-RES-002", "OPEN", [
                ("ROOM_CHARGE", "Lake View Suite - nightly rate", "18500", "ROOM-2"),
                ("POS_CHARGE", "Pool bar refreshments", "3400", "POS-1002"),
                ("PAYMENT", "Visa card payment", "10000", "CARD-8821"),
            ]),
            ("DEMO-FOL-003", "DEMO-RES-003", "OPEN", [
                ("ROOM_CHARGE", "Marina Penthouse - nightly rate", "32000", "ROOM-3"),
                ("POS_CHARGE", "Sunset yacht cruise", "24000", "MARINA-73"),
                ("PAYMENT", "Advance card payment", "40000", "CARD-9014"),
            ]),
            ("DEMO-FOL-004", "DEMO-RES-007", "CLOSED", [
                ("ROOM_CHARGE", "Garden Suite - three nights", "36000", "ROOM-4"),
                ("PAYMENT", "Corporate settlement", "36000", "SHL-PAY-22"),
            ]),
        ]
        for folio_number, reservation_number, status, lines in folio_specs:
            reservation = reservations[reservation_number]
            folio, _ = Folio.objects.update_or_create(
                folio_number=folio_number,
                defaults={
                    "reservation": reservation,
                    "business_partner": reservation.business_partner,
                    "room": reservation.room,
                    "status": status,
                    "closed_at": now - timedelta(days=5) if status == "CLOSED" else None,
                },
            )
            charge_total = Decimal("0")
            payment_total = Decimal("0")
            for line_type, description, amount, reference in lines:
                amount = Decimal(amount)
                FolioLine.objects.update_or_create(
                    folio=folio,
                    reference=reference,
                    defaults={
                        "line_type": line_type,
                        "description": description,
                        "amount": amount,
                    },
                )
                if line_type == FolioLine.LineType.PAYMENT:
                    payment_total += amount
                else:
                    charge_total += amount
            folio.charge_total = charge_total
            folio.payment_total = payment_total
            folio.balance_due = charge_total - payment_total
            folio.save(update_fields=["charge_total", "payment_total", "balance_due"])

        request_rows = [
            ("DEMO-SR-001", "L11", "amina-hassan", "HOUSEKEEPING", "NORMAL", "DISPATCHED", "Extra towels and bathrobes", "Guest requested two extra bathrobes before dinner.", 20),
            ("DEMO-SR-002", "L22", None, "MAINTENANCE", "HIGH", "ESCALATED", "Air conditioner inspection", "Cooling unit is tripping after ten minutes.", 30),
            ("DEMO-SR-003", "P01", "sophia-martin", "CONCIERGE", "HIGH", "OPEN", "Sunset yacht departure", "Confirm sparkling water and child life jacket onboard.", 15),
            ("DEMO-SR-004", "V01", "neema-mwangi", "HOUSEKEEPING", "NORMAL", "RESOLVED", "Baby cot setup", "Cot and linen delivered to the second bedroom.", 25),
            ("DEMO-SR-005", "G02", None, "HOUSEKEEPING", "NORMAL", "OPEN", "Departure room turnaround", "Priority clean for an early arrival.", 35),
            ("DEMO-SR-006", "L21", "daniel-okello", "SECURITY", "LOW", "RESOLVED", "Found property logged", "Guest sunglasses secured at reception.", 15),
        ]
        for ticket, room, partner, department, priority, status, title, description, sla in request_rows:
            ServiceRequest.objects.update_or_create(
                ticket_number=ticket,
                defaults={
                    "room": rooms[room],
                    "business_partner": partners.get(partner),
                    "department": department,
                    "priority": priority,
                    "status": status,
                    "title": title,
                    "description": description,
                    "sla_minutes": sla,
                    "escalated_at": now - timedelta(minutes=45) if status == "ESCALATED" else None,
                    "resolved_at": now - timedelta(hours=2) if status == "RESOLVED" else None,
                },
            )

        categories = {}
        for code, name, tab, station, tax_rate in [
            ("breakfast", "Breakfast", "Breakfast", "Main Kitchen", "16.00"),
            ("beverages", "Beverages", "Drinks", "Service Bar", "16.00"),
            ("cocktails", "Cocktails", "Pool Bar", "Pool Bar", "16.00"),
            ("experiences", "Experiences", "Marina", "Marina Desk", "16.00"),
        ]:
            categories[code], _ = ProductCategory.objects.update_or_create(
                code=code,
                defaults={
                    "name": name,
                    "tax_code": "KRA_ETIMS_A",
                    "tax_rate": Decimal(tax_rate),
                    "ui_tab": tab,
                    "route_station": station,
                    "is_active": True,
                },
            )

        products = {}
        product_rows = [
            ("FOOD-BREAKFAST-FULL", "G8 Full Breakfast", "breakfast", "BILLABLE", "EACH", "1450", "Full breakfast with eggs, sausage, fruit, and pastries."),
            ("FOOD-AVOCADO-TOAST", "Avocado & Poached Eggs", "breakfast", "BILLABLE", "EACH", "1250", "Sourdough, avocado, poached eggs, and garden herbs."),
            ("DRINK-COFFEE", "Kenyan House Coffee", "beverages", "BILLABLE", "EACH", "420", "Freshly brewed Kenyan arabica coffee."),
            ("DRINK-FRESH-JUICE", "Fresh Passion Juice", "beverages", "BILLABLE", "EACH", "550", "Fresh passion fruit juice served chilled."),
            ("BAR-DAWA", "Classic Dawa", "cocktails", "BILLABLE", "EACH", "950", "Vodka, lime, honey, and crushed ice."),
            ("BAR-SPARKLING-WATER", "Sparkling Water 750ml", "beverages", "BILLABLE", "EACH", "480", "Chilled sparkling mineral water."),
            ("EXP-SUNSET-CRUISE", "Sunset Yacht Cruise", "experiences", "SERVICE", "EACH", "12000", "Private two-hour cruise with refreshments."),
            ("EXP-FISHING", "Guided Lake Fishing", "experiences", "SERVICE", "EACH", "8500", "Half-day guided fishing experience."),
        ]
        for sku, name, category, product_type, unit, price, description in product_rows:
            products[sku], _ = Product.objects.update_or_create(
                sku=sku,
                defaults={
                    "name": name,
                    "product_type": product_type,
                    "category": categories[category],
                    "unit": unit,
                    "package_type": "INDIVIDUAL",
                    "pack_size": Decimal("1"),
                    "quantity": Decimal("50") if product_type == "BILLABLE" else Decimal("0"),
                    "description": description,
                    "is_sellable": True,
                    "is_inventory_tracked": product_type == "BILLABLE",
                    "is_active": True,
                },
            )
            products[sku].demo_price = Decimal(price)

        standard_menu, _ = SalesPricelist.objects.update_or_create(
            code="standard-menu",
            defaults={
                "name": "Villa Standard Menu",
                "description": "All-day restaurant and in-house guest pricing.",
                "service_point_kind": "RESTAURANT",
                "service_point": service_points["restaurant-pos"],
                "is_active": True,
            },
        )
        standard_menu.service_points.set([
            service_points["restaurant-pos"],
            service_points["main-frontdesk"],
        ])
        pool_menu, _ = SalesPricelist.objects.update_or_create(
            code="pool-bar-menu",
            defaults={
                "name": "Infinity Pool Bar Menu",
                "description": "Poolside drinks and light service pricing.",
                "service_point_kind": "BAR",
                "service_point": service_points["pool-bar-pos"],
                "is_active": True,
            },
        )
        pool_menu.service_points.set([service_points["pool-bar-pos"]])
        marina_menu, _ = SalesPricelist.objects.update_or_create(
            code="marina-experiences",
            defaults={
                "name": "Marina Experiences",
                "description": "Yacht cruises and lake activities.",
                "service_point_kind": "MARINA",
                "service_point": service_points["marina-desk"],
                "is_active": True,
            },
        )
        marina_menu.service_points.set([service_points["marina-desk"]])

        for sku, product in products.items():
            target = marina_menu if sku.startswith("EXP-") else pool_menu if sku.startswith("BAR-") else standard_menu
            SalesPricelistItem.objects.update_or_create(
                pricelist=target,
                product=product,
                defaults={"price": product.demo_price, "currency": "KES"},
            )

        order_specs = [
            ("DEMO-SO-001", "restaurant-pos", "Table 4", "Amina Hassan", "INVOICED", [("FOOD-BREAKFAST-FULL", 2), ("DRINK-COFFEE", 2)]),
            ("DEMO-SO-002", "pool-bar-pos", "Sunbed 6", "Daniel Okello", "INVOICED", [("BAR-DAWA", 2), ("BAR-SPARKLING-WATER", 1)]),
            ("DEMO-SO-003", "marina-desk", "Jetty", "Sophia Martin", "INVOICED", [("EXP-SUNSET-CRUISE", 2)]),
            ("DEMO-SO-004", "restaurant-pos", "Villa V01", "Neema Mwangi", "SENT", [("FOOD-AVOCADO-TOAST", 2), ("DRINK-FRESH-JUICE", 3)]),
            ("DEMO-SO-005", "pool-bar-pos", "Terrace 2", "Walk-in Guest", "DRAFT", [("BAR-DAWA", 1), ("DRINK-FRESH-JUICE", 2)]),
        ]
        orders = {}
        invoices = {}
        for order_number, point, table, customer, status, items in order_specs:
            subtotal = sum(products[sku].demo_price * quantity for sku, quantity in items)
            tax = (subtotal * Decimal("0.16")).quantize(Decimal("0.01"))
            grand_total = subtotal + tax
            order, _ = SalesOrder.objects.update_or_create(
                order_number=order_number,
                defaults={
                    "branch": naivasha,
                    "service_point": service_points[point],
                    "table_name": table,
                    "customer_name": customer,
                    "waiter_keycloak_sub": "demo-waiter-001",
                    "status": status,
                    "subtotal": subtotal,
                    "tax_total": tax,
                    "discount_total": Decimal("0"),
                    "grand_total": grand_total,
                    "notes": "Demo transaction showing the complete POS workflow.",
                },
            )
            orders[order_number] = order
            order.items.all().delete()
            for sku, quantity in items:
                product = products[sku]
                line_subtotal = product.demo_price * quantity
                line_tax = (line_subtotal * Decimal("0.16")).quantize(Decimal("0.01"))
                SalesOrderItem.objects.create(
                    order=order,
                    product=product,
                    service_point=service_points[point],
                    quantity=Decimal(quantity),
                    unit_price=product.demo_price,
                    tax_total=line_tax,
                    discount_total=Decimal("0"),
                    line_total=line_subtotal + line_tax,
                    status="SENT_TO_KITCHEN" if status != "DRAFT" else "PENDING_SEND",
                    routed_station=product.category.route_station,
                    sent_at=now - timedelta(minutes=20) if status != "DRAFT" else None,
                )

            if status == "INVOICED":
                invoice_number = order_number.replace("SO", "INV")
                invoice_status = "UNPAID"
                paid_total = Decimal("0")
                if order_number == "DEMO-SO-001":
                    invoice_status, paid_total = "CLOSED", grand_total
                elif order_number == "DEMO-SO-002":
                    invoice_status, paid_total = "PARTIALLY_PAID", Decimal("1500")
                invoice, _ = SalesInvoice.objects.update_or_create(
                    invoice_number=invoice_number,
                    defaults={
                        "order": order,
                        "branch": naivasha,
                        "customer_name": customer,
                        "subtotal": subtotal,
                        "tax_total": tax,
                        "discount_total": Decimal("0"),
                        "grand_total": grand_total,
                        "paid_total": paid_total,
                        "balance_due": max(grand_total - paid_total, Decimal("0")),
                        "status": invoice_status,
                        "etims_status": "SYNCED" if invoice_status == "CLOSED" else "PENDING_SYNC",
                        "fiscal_payload": {"demo": True, "order_number": order_number},
                        "synced_at": now - timedelta(minutes=10) if invoice_status == "CLOSED" else None,
                    },
                )
                invoices[order_number] = invoice

        cash = PaymentMethod.objects.get(code="cash")
        mpesa = PaymentMethod.objects.get(code="lipa-na-mpesa")
        SalesPayment.objects.update_or_create(
            invoice=invoices["DEMO-SO-001"],
            reference="DEMO-MPESA-1001",
            defaults={
                "payment_method": mpesa,
                "amount": invoices["DEMO-SO-001"].grand_total,
                "currency": "KES",
                "status": "CLEARED",
                "received_by": "demo-cashier-001",
            },
        )
        SalesPayment.objects.update_or_create(
            invoice=invoices["DEMO-SO-002"],
            reference="DEMO-CASH-1002",
            defaults={
                "payment_method": cash,
                "amount": Decimal("1500"),
                "currency": "KES",
                "status": "CLEARED",
                "received_by": "demo-cashier-001",
            },
        )

        payment_run, _ = CustomerPaymentRun.objects.update_or_create(
            run_number="DEMO-CPR-001",
            defaults={
                "customer_name": "Savannah Holdings Ltd",
                "amount": Decimal("50000"),
                "unapplied_amount": Decimal("50000"),
                "status": "DRAFT",
                "notes": "Corporate advance awaiting allocation to guest invoices.",
            },
        )
        CustomerPaymentRunAllocation.objects.filter(payment_run=payment_run).delete()

        for sub, email, first_name, last_name, roles in [
            ("demo-manager-001", "manager@g8yachtvilla.co.ke", "Grace", "Wanjiku", ["POS_MANAGER"]),
            ("demo-frontdesk-001", "frontdesk@g8yachtvilla.co.ke", "Brian", "Kiptoo", ["FRONTDESK_AGENT"]),
            ("demo-waiter-001", "waiter@g8yachtvilla.co.ke", "Faith", "Achieng", ["WAITER"]),
            ("demo-cashier-001", "cashier@g8yachtvilla.co.ke", "Peter", "Mwangi", ["WAITER"]),
        ]:
            UserIdentity.objects.update_or_create(
                keycloak_sub=sub,
                defaults={
                    "email": email,
                    "username": email.split("@")[0],
                    "first_name": first_name,
                    "last_name": last_name,
                    "realm_roles": roles,
                    "is_active": True,
                    "last_seen_at": now,
                },
            )

        counts = {
            "guests and partners": BusinessPartner.objects.filter(code__in=partners).count(),
            "rooms": Room.objects.filter(number__in=rooms).count(),
            "reservations": Reservation.objects.filter(reservation_number__startswith="DEMO-").count(),
            "folios": Folio.objects.filter(folio_number__startswith="DEMO-").count(),
            "service requests": ServiceRequest.objects.filter(ticket_number__startswith="DEMO-").count(),
            "products": Product.objects.filter(sku__in=products).count(),
            "sales orders": SalesOrder.objects.filter(order_number__startswith="DEMO-").count(),
            "invoices": SalesInvoice.objects.filter(invoice_number__startswith="DEMO-").count(),
        }
        summary = ", ".join(f"{value} {label}" for label, value in counts.items())
        self.stdout.write(self.style.SUCCESS(f"Demo data ready: {summary}."))
