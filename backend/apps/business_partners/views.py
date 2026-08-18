from apps.common.views import DetailAPIView, ListCreateAPIView
from .models import BusinessPartner
from .serializers import BusinessPartnerSerializer


class BusinessPartnerListCreateView(ListCreateAPIView):
    model = BusinessPartner
    serializer_class = BusinessPartnerSerializer


class BusinessPartnerDetailView(DetailAPIView):
    model = BusinessPartner
    serializer_class = BusinessPartnerSerializer
