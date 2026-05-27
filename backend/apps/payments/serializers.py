from rest_framework import serializers

from .models import BankAccount, PaymentMethod, PaymentRoutingRule


class PaymentMethodSerializer(serializers.ModelSerializer):
    method_type_display = serializers.CharField(source="get_method_type_display", read_only=True)

    class Meta:
        model = PaymentMethod
        fields = [
            "id",
            "name",
            "code",
            "method_type",
            "method_type_display",
            "opens_cash_drawer",
            "requires_reference",
            "requires_customer",
            "requires_room_verification",
            "posts_to_accounts_receivable",
            "is_active",
        ]


class BankAccountSerializer(serializers.ModelSerializer):
    account_type_display = serializers.CharField(source="get_account_type_display", read_only=True)

    class Meta:
        model = BankAccount
        fields = [
            "id",
            "name",
            "code",
            "account_type",
            "account_type_display",
            "bank_name",
            "account_number",
            "till_number",
            "ledger_account",
            "currency",
            "is_active",
        ]


class PaymentRoutingRuleSerializer(serializers.ModelSerializer):
    payment_method_name = serializers.CharField(source="payment_method.name", read_only=True)
    bank_account_name = serializers.CharField(source="bank_account.name", read_only=True)
    service_point_name = serializers.CharField(source="service_point.name", read_only=True)

    class Meta:
        model = PaymentRoutingRule
        fields = [
            "id",
            "payment_method",
            "payment_method_name",
            "bank_account",
            "bank_account_name",
            "service_point",
            "service_point_name",
            "service_point_kind",
            "priority",
            "is_active",
        ]
