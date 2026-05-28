from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsPosManager
from apps.pagination import paginated_response

from .models import BankAccount, PaymentMethod, PaymentRoutingRule
from .serializers import BankAccountSerializer, PaymentMethodSerializer, PaymentRoutingRuleSerializer


class ListCreateMixin(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def get_queryset(self):
        return self.model.objects.all()

    def get(self, request):
        queryset = self.get_queryset()
        return paginated_response(request, queryset, self.serializer_class)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.serializer_class(instance).data, status=status.HTTP_201_CREATED)


class DetailMixin(APIView):
    permission_classes = [IsPosManager]
    model = None
    serializer_class = None

    def patch(self, request, pk):
        instance = get_object_or_404(self.model, pk=pk)
        serializer = self.serializer_class(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(self.serializer_class(instance).data)


class PaymentMethodListCreateView(ListCreateMixin):
    model = PaymentMethod
    serializer_class = PaymentMethodSerializer


class PaymentMethodDetailView(DetailMixin):
    model = PaymentMethod
    serializer_class = PaymentMethodSerializer


class BankAccountListCreateView(ListCreateMixin):
    model = BankAccount
    serializer_class = BankAccountSerializer


class BankAccountDetailView(DetailMixin):
    model = BankAccount
    serializer_class = BankAccountSerializer


class PaymentRoutingRuleListCreateView(ListCreateMixin):
    model = PaymentRoutingRule
    serializer_class = PaymentRoutingRuleSerializer

    def get_queryset(self):
        return PaymentRoutingRule.objects.select_related("payment_method", "bank_account", "service_point")


class PaymentRoutingRuleDetailView(DetailMixin):
    model = PaymentRoutingRule
    serializer_class = PaymentRoutingRuleSerializer
