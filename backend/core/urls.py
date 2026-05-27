from django.contrib import admin
from django.urls import path, include
from apps.users.views import MyTokenObtainPairView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    # Swagger UI endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/business-partners/', include('apps.business_partners.urls')),
    path('api/concierge/', include('apps.concierge.urls')),
    path('api/folios/', include('apps.folios.urls')),
    path('api/organisation/', include('apps.organisation.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/reservations/', include('apps.reservations.urls')),
    path('api/rooms/', include('apps.rooms.urls')),
    path('api/sales/', include('apps.sales.urls')),
    path('api/taxes/', include('apps.taxes.urls')),
    path('api/users/', include('apps.users.urls')),
]
