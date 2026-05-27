from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserIdentitySerializer


class MeView(APIView):
    def get(self, request):
        serializer = UserIdentitySerializer(request.user.identity)
        return Response(
            {
                "identity": serializer.data,
                "roles": request.user.realm_roles,
            }
        )


class MyTokenObtainPairView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        return Response(
            {
                "detail": (
                    "Password login is disabled. Authenticate with Keycloak "
                    "and send the access token as a Bearer token."
                )
            },
            status=405,
        )
