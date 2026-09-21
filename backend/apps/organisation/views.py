"""Organization and branch management CRUD API views."""

from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import Branch, Organization
from .serializers import BranchSerializer, OrganizationSerializer


class OrganizationListCreateView(ListCreateAPIView):
    """List and create organization records."""

    model = Organization
    serializer_class = OrganizationSerializer


class OrganizationDetailView(DetailAPIView):
    """Retrieve, update, or delete a single organization."""

    model = Organization
    serializer_class = OrganizationSerializer


class BranchListCreateView(ListCreateAPIView):
    """List and create branch records for organizations."""

    model = Branch
    serializer_class = BranchSerializer

    def get_queryset(self):
        """Include parent organization data for branch listing responses."""
        return Branch.objects.select_related("organization")


class BranchDetailView(DetailAPIView):
    """Retrieve, update, or delete a branch."""

    model = Branch
    serializer_class = BranchSerializer
