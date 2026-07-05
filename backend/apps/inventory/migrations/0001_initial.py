import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("products", "0007_salespricelist_service_points"),
        ("users", "0004_seed_app_permissions"),
    ]

    operations = [
        migrations.CreateModel(
            name="InventoryDocument",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("document_number", models.CharField(blank=True, max_length=40, unique=True)),
                (
                    "document_type",
                    models.CharField(
                        choices=[
                            ("PURCHASE_REQUEST", "Request for Purchase"),
                            ("REQUISITION", "Requisition"),
                            ("GOODS_DELIVERY_NOTE", "Goods Delivery Note"),
                            ("GOODS_RECEIVED_NOTE", "Goods Received Note"),
                        ],
                        max_length=30,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("DRAFT", "Draft"),
                            ("SUBMITTED", "Submitted"),
                            ("APPROVED", "Approved"),
                            ("RECEIVED", "Received"),
                            ("CANCELLED", "Cancelled"),
                        ],
                        default="DRAFT",
                        max_length=20,
                    ),
                ),
                ("supplier_name", models.CharField(blank=True, max_length=160)),
                ("notes", models.TextField(blank=True)),
                ("approved_at", models.DateTimeField(blank=True, null=True)),
                ("received_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="inventory_documents",
                        to="users.useridentity",
                    ),
                ),
                (
                    "source_document",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="generated_documents",
                        to="inventory.inventorydocument",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="InventoryThreshold",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("minimum_quantity", models.DecimalField(decimal_places=3, default=0, max_digits=14)),
                ("reorder_quantity", models.DecimalField(decimal_places=3, default=0, max_digits=14)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "product",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="inventory_threshold",
                        to="products.product",
                    ),
                ),
            ],
            options={"ordering": ["product__name"]},
        ),
        migrations.CreateModel(
            name="InventoryDocumentLine",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("requested_quantity", models.DecimalField(decimal_places=3, max_digits=14)),
                ("received_quantity", models.DecimalField(decimal_places=3, default=0, max_digits=14)),
                ("unit_cost", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("notes", models.CharField(blank=True, max_length=240)),
                (
                    "document",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lines", to="inventory.inventorydocument"),
                ),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="inventory_document_lines",
                        to="products.product",
                    ),
                ),
            ],
            options={"ordering": ["id"]},
        ),
        migrations.CreateModel(
            name="StockMovement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "movement_type",
                    models.CharField(
                        choices=[("IN", "Stock In"), ("OUT", "Stock Out"), ("ADJUSTMENT", "Adjustment")],
                        max_length=20,
                    ),
                ),
                ("quantity", models.DecimalField(decimal_places=3, max_digits=14)),
                ("notes", models.CharField(blank=True, max_length=240)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "document",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="stock_movements",
                        to="inventory.inventorydocument",
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="stock_movements",
                        to="products.product",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
