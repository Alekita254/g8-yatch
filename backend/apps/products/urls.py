from django.urls import path

from .views import (
    ProductCategoryDetailView,
    ProductCategoryListCreateView,
    ProductDetailView,
    ProductListCreateView,
    PurchasePricelistDetailView,
    PurchasePricelistListCreateView,
    SalesPricelistDetailView,
    SalesPricelistListCreateView,
)

urlpatterns = [
    path("categories/", ProductCategoryListCreateView.as_view(), name="product-categories"),
    path("categories/<int:pk>/", ProductCategoryDetailView.as_view(), name="product-category-detail"),
    path("items/", ProductListCreateView.as_view(), name="products"),
    path("items/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("sales-pricelists/", SalesPricelistListCreateView.as_view(), name="sales-pricelists"),
    path("sales-pricelists/<int:pk>/", SalesPricelistDetailView.as_view(), name="sales-pricelist-detail"),
    path("purchase-pricelists/", PurchasePricelistListCreateView.as_view(), name="purchase-pricelists"),
    path("purchase-pricelists/<int:pk>/", PurchasePricelistDetailView.as_view(), name="purchase-pricelist-detail"),
]
