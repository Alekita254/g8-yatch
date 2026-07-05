from django.urls import path

from .views import (
    InventoryDocumentApproveView,
    InventoryDocumentDeliveryNoteView,
    InventoryDocumentDetailView,
    InventoryDocumentListCreateView,
    InventoryDocumentPdfView,
    InventoryDocumentReceiveView,
    InventoryDocumentRequisitionView,
    InventoryThresholdDetailView,
    InventoryThresholdListCreateView,
    LowStockProductListView,
    StockMovementListView,
)

urlpatterns = [
    path("thresholds/", InventoryThresholdListCreateView.as_view(), name="inventory-thresholds"),
    path("thresholds/<int:pk>/", InventoryThresholdDetailView.as_view(), name="inventory-threshold-detail"),
    path("low-stock/", LowStockProductListView.as_view(), name="inventory-low-stock"),
    path("documents/", InventoryDocumentListCreateView.as_view(), name="inventory-documents"),
    path("documents/<int:pk>/", InventoryDocumentDetailView.as_view(), name="inventory-document-detail"),
    path("documents/<int:pk>/pdf/", InventoryDocumentPdfView.as_view(), name="inventory-document-pdf"),
    path("documents/<int:pk>/approve/", InventoryDocumentApproveView.as_view(), name="inventory-document-approve"),
    path("documents/<int:pk>/requisition/", InventoryDocumentRequisitionView.as_view(), name="inventory-document-requisition"),
    path("documents/<int:pk>/delivery-note/", InventoryDocumentDeliveryNoteView.as_view(), name="inventory-document-delivery-note"),
    path("documents/<int:pk>/receive/", InventoryDocumentReceiveView.as_view(), name="inventory-document-receive"),
    path("movements/", StockMovementListView.as_view(), name="inventory-movements"),
]
