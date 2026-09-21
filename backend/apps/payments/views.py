"""Payment master-data CRUD views for methods, bank accounts, and routing rules."""

from apps.common.views import DetailAPIView, ListCreateAPIView
from apps.users.permissions import IsPosManagerOrReadOnly
from .models import BankAccount, PaymentMethod, PaymentRoutingRule
from .serializers import (
    BankAccountSerializer,
    PaymentMethodSerializer,
    PaymentRoutingRuleSerializer,
)


class PaymentMethodListCreateView(ListCreateAPIView):
    """List and create supported payment methods."""

    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentMethod
    serializer_class = PaymentMethodSerializer


class PaymentMethodDetailView(DetailAPIView):
    """Retrieve, update, or delete a payment method."""

    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentMethod
    serializer_class = PaymentMethodSerializer


class BankAccountListCreateView(ListCreateAPIView):
    """List and create bank accounts used for settlements."""

    permission_classes = [IsPosManagerOrReadOnly]
    model = BankAccount
    serializer_class = BankAccountSerializer


class BankAccountDetailView(DetailAPIView):
    """Retrieve, update, or delete a bank account."""

    permission_classes = [IsPosManagerOrReadOnly]
    model = BankAccount
    serializer_class = BankAccountSerializer


class PaymentRoutingRuleListCreateView(ListCreateAPIView):
    """List and create payment routing rules for service points."""

    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentRoutingRule
    serializer_class = PaymentRoutingRuleSerializer

    def get_queryset(self):
        """Fetch routing rules with related references for display efficiency."""
        return PaymentRoutingRule.objects.select_related(
            "payment_method", "bank_account", "service_point"
        )


class PaymentRoutingRuleDetailView(DetailAPIView):
    """Retrieve, update, or delete a payment routing rule."""

    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentRoutingRule
    serializer_class = PaymentRoutingRuleSerializer
