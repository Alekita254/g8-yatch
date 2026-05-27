from django.db import models


class PaymentMethod(models.Model):
    class MethodType(models.TextChoices):
        CASH = "CASH", "Cash"
        MPESA = "MPESA", "M-Pesa"
        CARD = "CARD", "Card"
        CITY_LEDGER = "CITY_LEDGER", "City Ledger"
        ROOM_CHARGE = "ROOM_CHARGE", "Room Charge"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"

    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=80, unique=True)
    method_type = models.CharField(max_length=30, choices=MethodType.choices)
    opens_cash_drawer = models.BooleanField(default=False)
    requires_reference = models.BooleanField(default=False)
    requires_customer = models.BooleanField(default=False)
    requires_room_verification = models.BooleanField(default=False)
    posts_to_accounts_receivable = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["method_type", "name"]

    def __str__(self):
        return self.name


class BankAccount(models.Model):
    class AccountType(models.TextChoices):
        BANK = "BANK", "Bank Account"
        MPESA_TILL = "MPESA_TILL", "M-Pesa Till"
        CASH_TILL = "CASH_TILL", "Cash Till"
        CARD_CLEARING = "CARD_CLEARING", "Card Clearing"
        AR_LEDGER = "AR_LEDGER", "Accounts Receivable"

    name = models.CharField(max_length=140)
    code = models.SlugField(max_length=80, unique=True)
    account_type = models.CharField(max_length=30, choices=AccountType.choices)
    bank_name = models.CharField(max_length=120, blank=True)
    account_number = models.CharField(max_length=80, blank=True)
    till_number = models.CharField(max_length=80, blank=True)
    ledger_account = models.CharField(max_length=100)
    currency = models.CharField(max_length=3, default="KES")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["account_type", "name"]

    def __str__(self):
        return self.name


class PaymentRoutingRule(models.Model):
    payment_method = models.ForeignKey(
        PaymentMethod,
        related_name="routing_rules",
        on_delete=models.PROTECT,
    )
    bank_account = models.ForeignKey(
        BankAccount,
        related_name="routing_rules",
        on_delete=models.PROTECT,
    )
    service_point = models.ForeignKey(
        "users.ServicePoint",
        related_name="payment_routing_rules",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )
    service_point_kind = models.CharField(max_length=40, blank=True)
    priority = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["priority", "payment_method__name"]

    def __str__(self):
        target = self.service_point or self.service_point_kind or "Default"
        return f"{self.payment_method} -> {self.bank_account} ({target})"
