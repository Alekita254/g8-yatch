from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import Branch, Organization
from .serializers import BranchSerializer, OrganizationSerializer


class OrganizationListCreateView(ListCreateAPIView):
    model = Organization
    serializer_class = OrganizationSerializer


class OrganizationDetailView(DetailAPIView):
    model = Organization
    serializer_class = OrganizationSerializer


class BranchListCreateView(ListCreateAPIView):
    model = Branch
    serializer_class = BranchSerializer

    def get_queryset(self):
        return Branch.objects.select_related("organization")


class BranchDetailView(DetailAPIView):
    model = Branch
    serializer_class = BranchSerializer
