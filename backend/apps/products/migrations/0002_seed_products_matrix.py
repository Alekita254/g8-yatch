from decimal import Decimal

from django.db import migrations


def seed_products_matrix(apps, schema_editor):
    ProductCategory = apps.get_model("products", "ProductCategory")
    Product = apps.get_model("products", "Product")
    BillOfMaterialsItem = apps.get_model("products", "BillOfMaterialsItem")
    SalesPricelist = apps.get_model("products", "SalesPricelist")
    SalesPricelistItem = apps.get_model("products", "SalesPricelistItem")
    PurchasePricelist = apps.get_model("products", "PurchasePricelist")
    PurchasePricelistItem = apps.get_model("products", "PurchasePricelistItem")

    food, _ = ProductCategory.objects.update_or_create(
        code="food",
        defaults={
            "name": "Food",
            "tax_code": "KRA_ETIMS_A",
            "tax_rate": Decimal("16.00"),
            "ui_tab": "Dining",
            "is_active": True,
        },
    )
    main_course, _ = ProductCategory.objects.update_or_create(
        code="main-course",
        defaults={
            "name": "Main Course",
            "parent": food,
            "tax_code": "KRA_ETIMS_A",
            "tax_rate": Decimal("16.00"),
            "ui_tab": "Dinner",
            "is_active": True,
        },
    )
    seafood, _ = ProductCategory.objects.update_or_create(
        code="seafood",
        defaults={
            "name": "Seafood",
            "parent": main_course,
            "tax_code": "KRA_ETIMS_A",
            "tax_rate": Decimal("16.00"),
            "ui_tab": "Dinner",
            "route_printer_ip": "192.168.1.50",
            "route_station": "Hot Kitchen Seafood",
            "is_active": True,
        },
    )
    raw_food, _ = ProductCategory.objects.update_or_create(
        code="raw-food",
        defaults={
            "name": "Raw Food Inventory",
            "tax_code": "",
            "tax_rate": Decimal("0.00"),
            "ui_tab": "Store",
            "is_active": True,
        },
    )

    tilapia, _ = Product.objects.update_or_create(
        sku="FOOD-GRILLED-TILAPIA",
        defaults={
            "name": "Grilled Tilapia",
            "product_type": "BILLABLE",
            "category": seafood,
            "unit": "EACH",
            "description": "Whole grilled tilapia routed to the hot kitchen seafood station.",
            "is_sellable": True,
            "is_inventory_tracked": False,
            "is_active": True,
        },
    )
    fish, _ = Product.objects.update_or_create(
        sku="RAW-WHOLE-TILAPIA",
        defaults={
            "name": "Whole Tilapia",
            "product_type": "RAW",
            "category": raw_food,
            "unit": "EACH",
            "is_sellable": False,
            "is_inventory_tracked": True,
            "is_active": True,
        },
    )
    masala, _ = Product.objects.update_or_create(
        sku="RAW-FISH-MASALA",
        defaults={
            "name": "Fish Masala",
            "product_type": "RAW",
            "category": raw_food,
            "unit": "G",
            "is_sellable": False,
            "is_inventory_tracked": True,
            "is_active": True,
        },
    )
    oil, _ = Product.objects.update_or_create(
        sku="RAW-COOKING-OIL",
        defaults={
            "name": "Cooking Oil",
            "product_type": "RAW",
            "category": raw_food,
            "unit": "ML",
            "is_sellable": False,
            "is_inventory_tracked": True,
            "is_active": True,
        },
    )

    for component, quantity, unit in [
        (fish, Decimal("1.000"), "EACH"),
        (masala, Decimal("10.000"), "G"),
        (oil, Decimal("50.000"), "ML"),
    ]:
        BillOfMaterialsItem.objects.update_or_create(
            product=tilapia,
            component=component,
            defaults={"quantity": quantity, "unit": unit},
        )

    standard, _ = SalesPricelist.objects.update_or_create(
        code="standard-menu",
        defaults={
            "name": "Standard Menu",
            "description": "Walk-in restaurant menu pricing.",
            "service_point_kind": "RESTAURANT",
            "is_active": True,
        },
    )
    room_service, _ = SalesPricelist.objects.update_or_create(
        code="room-service-premium",
        defaults={
            "name": "Room Service Premium",
            "description": "Premium pricing for in-room service delivery.",
            "service_point_kind": "FRONTDESK",
            "is_active": True,
        },
    )
    sunday, _ = SalesPricelist.objects.update_or_create(
        code="sunday-special",
        defaults={
            "name": "Sunday Special",
            "description": "Promotional lunch pricing.",
            "service_point_kind": "RESTAURANT",
            "is_active": True,
        },
    )

    for pricelist, price in [
        (standard, Decimal("1500.00")),
        (room_service, Decimal("1800.00")),
        (sunday, Decimal("1200.00")),
    ]:
        SalesPricelistItem.objects.update_or_create(
            pricelist=pricelist,
            product=tilapia,
            defaults={"price": price, "currency": "KES"},
        )

    fish_supplier, _ = PurchasePricelist.objects.update_or_create(
        code="lake-victoria-fishmongers",
        defaults={
            "supplier_name": "Lake Victoria Fishmongers",
            "description": "Contracted price for whole tilapia.",
            "is_active": True,
        },
    )
    PurchasePricelistItem.objects.update_or_create(
        pricelist=fish_supplier,
        product=fish,
        defaults={"price": Decimal("400.00"), "currency": "KES", "unit": "EACH"},
    )


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_products_matrix, migrations.RunPython.noop),
    ]
