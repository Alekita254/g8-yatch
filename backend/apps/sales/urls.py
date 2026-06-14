from django.urls import path

from .views import (
    CustomerPaymentRunApplyView,
    CustomerPaymentRunListCreateView,
    GuestVisitListView,
    GuestVisitDetailView,
    GuestVisitWaiterAcknowledgeView,
    SalesInvoiceCreateFromOrderView,
    SalesInvoiceListView,
    SalesOrderDetailView,
    SalesOrderItemVoidView,
    SalesOrderListCreateView,
    SalesOrderSendView,
    SalesOrderStatusView,
    SalesPaymentListCreateView,
)

urlpatterns = [
    path("visits/", GuestVisitListView.as_view(), name="guest-visits"),
    path("visits/<int:pk>/", GuestVisitDetailView.as_view(), name="guest-visit-detail"),
    path("visits/<int:pk>/waiter-acknowledge/", GuestVisitWaiterAcknowledgeView.as_view(), name="guest-visit-waiter-acknowledge"),
    path("orders/", SalesOrderListCreateView.as_view(), name="sales-orders"),
    path("orders/<int:pk>/", SalesOrderDetailView.as_view(), name="sales-order-detail"),
    path("orders/<int:pk>/send/", SalesOrderSendView.as_view(), name="sales-order-send"),
    path("orders/<int:pk>/status/", SalesOrderStatusView.as_view(), name="sales-order-status"),
    path("orders/<int:pk>/items/<int:item_id>/void/", SalesOrderItemVoidView.as_view(), name="sales-order-item-void"),
    path("orders/<int:order_id>/invoice/", SalesInvoiceCreateFromOrderView.as_view(), name="sales-order-invoice"),
    path("invoices/", SalesInvoiceListView.as_view(), name="sales-invoices"),
    path("payments/", SalesPaymentListCreateView.as_view(), name="sales-payments"),
    path("payment-runs/", CustomerPaymentRunListCreateView.as_view(), name="customer-payment-runs"),
    path("payment-runs/<int:pk>/apply/", CustomerPaymentRunApplyView.as_view(), name="customer-payment-run-apply"),
]
