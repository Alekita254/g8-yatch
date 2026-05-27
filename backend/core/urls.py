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
    path('api/products/', include('apps.products.urls')),
    path('api/users/', include('apps.users.urls')),
]
