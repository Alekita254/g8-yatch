from django.urls import path

from .views import (
    DiscountRuleDetailView,
    DiscountRuleListCreateView,
    TaxCategoryDetailView,
    TaxCategoryListCreateView,
    TaxConfigurationDetailView,
    TaxConfigurationListCreateView,
    TaxOfficeDetailView,
    TaxOfficeListCreateView,
)

urlpatterns = [
    path("configurations/", TaxConfigurationListCreateView.as_view(), name="tax-configurations"),
    path("configurations/<int:pk>/", TaxConfigurationDetailView.as_view(), name="tax-configuration-detail"),
    path("categories/", TaxCategoryListCreateView.as_view(), name="tax-categories"),
    path("categories/<int:pk>/", TaxCategoryDetailView.as_view(), name="tax-category-detail"),
    path("offices/", TaxOfficeListCreateView.as_view(), name="tax-offices"),
    path("offices/<int:pk>/", TaxOfficeDetailView.as_view(), name="tax-office-detail"),
    path("discounts/", DiscountRuleListCreateView.as_view(), name="discount-rules"),
    path("discounts/<int:pk>/", DiscountRuleDetailView.as_view(), name="discount-rule-detail"),
]
