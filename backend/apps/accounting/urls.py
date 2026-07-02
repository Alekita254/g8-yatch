from django.urls import path

from .views import MonthlyAccountingSummaryView


urlpatterns = [
    path("monthly-summary/", MonthlyAccountingSummaryView.as_view(), name="accounting-monthly-summary"),
]
