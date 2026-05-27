from django.urls import path

from .views import (
    BankAccountDetailView,
    BankAccountListCreateView,
    PaymentMethodDetailView,
    PaymentMethodListCreateView,
    PaymentRoutingRuleDetailView,
    PaymentRoutingRuleListCreateView,
)

urlpatterns = [
    path("methods/", PaymentMethodListCreateView.as_view(), name="payment-methods"),
    path("methods/<int:pk>/", PaymentMethodDetailView.as_view(), name="payment-method-detail"),
    path("bank-accounts/", BankAccountListCreateView.as_view(), name="bank-accounts"),
    path("bank-accounts/<int:pk>/", BankAccountDetailView.as_view(), name="bank-account-detail"),
    path("routing-rules/", PaymentRoutingRuleListCreateView.as_view(), name="payment-routing-rules"),
    path("routing-rules/<int:pk>/", PaymentRoutingRuleDetailView.as_view(), name="payment-routing-rule-detail"),
]
