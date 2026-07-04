from math import ceil

from django.core.exceptions import FieldDoesNotExist
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def field_exists(model, field_name):
    try:
        model._meta.get_field(field_name)
    except FieldDoesNotExist:
        return False
    return True


def latest_first(queryset):
    model = queryset.model
    for field_name in ("created_at", "opened_at", "arrived_at", "id"):
        if field_exists(model, field_name):
            return queryset.order_by(f"-{field_name}")
    return queryset


def paginated_response(request, queryset, serializer_class):
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(latest_first(queryset), request)
    serializer = serializer_class(page, many=True)
    response = paginator.get_paginated_response(serializer.data)
    count = response.data["count"]
    page_size = paginator.get_page_size(request) or StandardResultsSetPagination.page_size
    page_number = paginator.page.number if hasattr(paginator, "page") else 1

    response.data["total"] = count
    response.data["page"] = page_number
    response.data["page_size"] = page_size
    response.data["total_pages"] = ceil(count / page_size) if page_size else 1
    return response
