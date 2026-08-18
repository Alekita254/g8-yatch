from rest_framework.views import APIView

from apps.users.permissions import IsPosManager
from .mixins import (
    CreateModelMixin,
    DestroyModelMixin,
    ListModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
)


class BaseAPIView(APIView):
    """Base API view configured with default POS Manager permission."""
    permission_classes = [IsPosManager]


class ListCreateAPIView(ListModelMixin, CreateModelMixin, BaseAPIView):
    """Generic view for listing and creating resource instances."""
    pass


class DetailAPIView(RetrieveModelMixin, UpdateModelMixin, BaseAPIView):
    """Generic view for retrieving and updating resource instances."""
    pass


class RetrieveUpdateAPIView(RetrieveModelMixin, UpdateModelMixin, BaseAPIView):
    """Generic view for retrieving and updating resource instances."""
    pass


class RetrieveUpdateDestroyAPIView(RetrieveModelMixin, UpdateModelMixin, DestroyModelMixin, BaseAPIView):
    """Generic view for retrieving, updating, and deleting resource instances."""
    pass
