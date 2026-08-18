from apps.common.views import DetailAPIView, ListCreateAPIView
from apps.users.permissions import IsPosManagerOrReadOnly
from .models import BankAccount, PaymentMethod, PaymentRoutingRule
from .serializers import (
    BankAccountSerializer,
    PaymentMethodSerializer,
    PaymentRoutingRuleSerializer,
)


class PaymentMethodListCreateView(ListCreateAPIView):
    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentMethod
    serializer_class = PaymentMethodSerializer


class PaymentMethodDetailView(DetailAPIView):
    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentMethod
    serializer_class = PaymentMethodSerializer


class BankAccountListCreateView(ListCreateAPIView):
    permission_classes = [IsPosManagerOrReadOnly]
    model = BankAccount
    serializer_class = BankAccountSerializer


class BankAccountDetailView(DetailAPIView):
    permission_classes = [IsPosManagerOrReadOnly]
    model = BankAccount
    serializer_class = BankAccountSerializer


class PaymentRoutingRuleListCreateView(ListCreateAPIView):
    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentRoutingRule
    serializer_class = PaymentRoutingRuleSerializer

    def get_queryset(self):
        return PaymentRoutingRule.objects.select_related(
            "payment_method", "bank_account", "service_point"
        )


class PaymentRoutingRuleDetailView(DetailAPIView):
    permission_classes = [IsPosManagerOrReadOnly]
    model = PaymentRoutingRule
    serializer_class = PaymentRoutingRuleSerializer
