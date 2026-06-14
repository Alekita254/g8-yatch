import uuid

from django.db import models


class GuestVisit(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CHECKOUT_REQUESTED = "CHECKOUT_REQUESTED", "Checkout requested"
        CLOSED = "CLOSED", "Closed"

    visit_number = models.CharField(max_length=40, unique=True)
    public_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    service_point = models.ForeignKey(
        "users.ServicePoint",
        related_name="guest_visits",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    service_area = models.CharField(max_length=80)
    table_name = models.CharField(max_length=80)
    guest_name = models.CharField(max_length=160, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    waiter_requested_at = models.DateTimeField(null=True, blank=True)
    waiter_acknowledged_at = models.DateTimeField(null=True, blank=True)
    checkout_requested_at = models.DateTimeField(null=True, blank=True)
    feedback_rating = models.PositiveSmallIntegerField(null=True, blank=True)
    feedback_comment = models.TextField(blank=True)
    arrived_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-arrived_at"]

    def __str__(self):
        return f"{self.visit_number} - {self.service_area} {self.table_name}"


class SalesOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SENT = "SENT", "Received"
        PREPARING = "PREPARING", "Preparing"
        READY = "READY", "Ready"
        SERVED = "SERVED", "Served"
        INVOICED = "INVOICED", "Invoiced"
        CANCELLED = "CANCELLED", "Cancelled"

    order_number = models.CharField(max_length=40, unique=True)
    visit = models.ForeignKey(
        GuestVisit,
        related_name="orders",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    branch = models.ForeignKey(
        "organisation.Branch",
        related_name="sales_orders",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    service_point = models.ForeignKey(
        "users.ServicePoint",
        related_name="sales_orders",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    table_name = models.CharField(max_length=80, blank=True)
    customer_name = models.CharField(max_length=160, blank=True)
    waiter_keycloak_sub = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number


class SalesOrderItem(models.Model):
    class Status(models.TextChoices):
        PENDING_SEND = "PENDING_SEND", "Pending Send"
        SENT_TO_KITCHEN = "SENT_TO_KITCHEN", "Sent to Kitchen"
        VOIDED = "VOIDED", "Voided"

    order = models.ForeignKey(SalesOrder, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey("products.Product", related_name="sales_order_items", on_delete=models.PROTECT)
    service_point = models.ForeignKey(
        "users.ServicePoint",
        related_name="sales_order_items",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING_SEND)
    routed_station = models.CharField(max_length=120, blank=True)
    void_reason = models.TextField(blank=True)
    voided_by = models.CharField(max_length=255, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    voided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.product} x {self.quantity}"


class SalesInvoice(models.Model):
    class Status(models.TextChoices):
        UNPAID = "UNPAID", "Unpaid"
        PARTIALLY_PAID = "PARTIALLY_PAID", "Partially Paid"
        CLOSED = "CLOSED", "Closed"
        CREDITED = "CREDITED", "Credited"

    class EtimsStatus(models.TextChoices):
        NOT_REQUIRED = "NOT_REQUIRED", "Not Required"
        PENDING_SYNC = "PENDING_SYNC", "Pending Sync"
        SYNCED = "SYNCED", "Synced"
        FAILED = "FAILED", "Failed"

    invoice_number = models.CharField(max_length=40, unique=True)
    order = models.OneToOneField(SalesOrder, related_name="invoice", on_delete=models.PROTECT)
    branch = models.ForeignKey("organisation.Branch", related_name="sales_invoices", null=True, blank=True, on_delete=models.PROTECT)
    customer_name = models.CharField(max_length=160, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.UNPAID)
    etims_status = models.CharField(max_length=30, choices=EtimsStatus.choices, default=EtimsStatus.PENDING_SYNC)
    fiscal_payload = models.JSONField(default=dict, blank=True)
    synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.invoice_number


class SalesPayment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CLEARED = "CLEARED", "Cleared"
        FAILED = "FAILED", "Failed"
        REVERSED = "REVERSED", "Reversed"

    invoice = models.ForeignKey(SalesInvoice, related_name="payments", on_delete=models.PROTECT)
    payment_method = models.ForeignKey("payments.PaymentMethod", related_name="sales_payments", on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="KES")
    reference = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CLEARED)
    received_by = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.invoice} {self.amount} {self.currency}"


class CustomerPaymentRun(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        APPLIED = "APPLIED", "Applied"

    run_number = models.CharField(max_length=40, unique=True)
    customer_name = models.CharField(max_length=160)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    unapplied_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    applied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.run_number


class CustomerPaymentRunAllocation(models.Model):
    payment_run = models.ForeignKey(CustomerPaymentRun, related_name="allocations", on_delete=models.CASCADE)
    invoice = models.ForeignKey(SalesInvoice, related_name="payment_run_allocations", on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.payment_run} -> {self.invoice}"
