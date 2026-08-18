from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from apps.pagination import paginated_response


class QuerySetMixin:
    """Base mixin providing standard queryset and serializer accessors."""
    model = None
    serializer_class = None
    lookup_field = "pk"
    lookup_url_kwarg = None

    def get_queryset(self):
        if self.model is not None:
            return self.model.objects.all()
        raise NotImplementedError(f"{self.__class__.__name__} must define 'model' or override 'get_queryset()'.")

    def get_serializer_class(self):
        if self.serializer_class is not None:
            return self.serializer_class
        raise NotImplementedError(f"{self.__class__.__name__} must define 'serializer_class' or override 'get_serializer_class()'.")

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault("context", {"request": getattr(self, "request", None), "view": self})
        return serializer_class(*args, **kwargs)

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        filter_kwargs = {self.lookup_field: lookup_value}
        return get_object_or_404(self.get_queryset(), **filter_kwargs)


class ListModelMixin(QuerySetMixin):
    """Mixin to list a paginated queryset."""
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        return paginated_response(request, queryset, self.get_serializer_class())


class CreateModelMixin(QuerySetMixin):
    """Mixin to validate and create a model instance."""
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        return serializer.save()


class RetrieveModelMixin(QuerySetMixin):
    """Mixin to retrieve a single model instance."""
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(self.get_serializer(instance).data)


class UpdateModelMixin(QuerySetMixin):
    """Mixin to partially or fully update a model instance."""
    def patch(self, request, *args, **kwargs):
        return self._update(request, partial=True, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self._update(request, partial=False, *args, **kwargs)

    def _update(self, request, partial=True, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_instance = self.perform_update(serializer)
        return Response(self.get_serializer(updated_instance).data)

    def perform_update(self, serializer):
        return serializer.save()


class DestroyModelMixin(QuerySetMixin):
    """Mixin to safely delete a model instance with integrity protection handling."""
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This item is linked to existing records and cannot be deleted. "
                        "Deactivate it instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    def perform_destroy(self, instance):
        instance.delete()
