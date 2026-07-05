from django.db import models


class InventoryThreshold(models.Model):
    product = models.OneToOneField(
        "products.Product",
        related_name="inventory_threshold",
        on_delete=models.CASCADE,
    )
    minimum_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    reorder_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["product__name"]

    def __str__(self):
        return f"{self.product} threshold"


class InventoryDocument(models.Model):
    class DocumentType(models.TextChoices):
        PURCHASE_REQUEST = "PURCHASE_REQUEST", "Request for Purchase"
        REQUISITION = "REQUISITION", "Requisition"
        GOODS_DELIVERY_NOTE = "GOODS_DELIVERY_NOTE", "Goods Delivery Note"
        GOODS_RECEIVED_NOTE = "GOODS_RECEIVED_NOTE", "Goods Received Note"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        APPROVED = "APPROVED", "Approved"
        RECEIVED = "RECEIVED", "Received"
        CANCELLED = "CANCELLED", "Cancelled"

    document_number = models.CharField(max_length=40, unique=True, blank=True)
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    supplier_name = models.CharField(max_length=160, blank=True)
    source_document = models.ForeignKey(
        "self",
        related_name="generated_documents",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        "users.UserIdentity",
        related_name="inventory_documents",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.document_number or self.get_document_type_display()

    def save(self, *args, **kwargs):
        creating = self.pk is None
        super().save(*args, **kwargs)
        if creating and not self.document_number:
            prefix = {
                self.DocumentType.PURCHASE_REQUEST: "RFP",
                self.DocumentType.REQUISITION: "REQ",
                self.DocumentType.GOODS_DELIVERY_NOTE: "GDN",
                self.DocumentType.GOODS_RECEIVED_NOTE: "GRN",
            }.get(self.document_type, "INV")
            self.document_number = f"{prefix}-{self.pk:06d}"
            super().save(update_fields=["document_number"])


class InventoryDocumentLine(models.Model):
    document = models.ForeignKey(InventoryDocument, related_name="lines", on_delete=models.CASCADE)
    product = models.ForeignKey("products.Product", related_name="inventory_document_lines", on_delete=models.PROTECT)
    requested_quantity = models.DecimalField(max_digits=14, decimal_places=3)
    received_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.CharField(max_length=240, blank=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product} x {self.requested_quantity}"


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        IN = "IN", "Stock In"
        OUT = "OUT", "Stock Out"
        ADJUSTMENT = "ADJUSTMENT", "Adjustment"

    product = models.ForeignKey("products.Product", related_name="stock_movements", on_delete=models.PROTECT)
    document = models.ForeignKey(
        InventoryDocument,
        related_name="stock_movements",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=14, decimal_places=3)
    notes = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product} {self.movement_type} {self.quantity}"
