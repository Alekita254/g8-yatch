import requests
from django.conf import settings


class KeycloakAdminError(RuntimeError):
    """Raised when Keycloak admin API operations fail."""

    pass


class KeycloakAdminClient:
    """Minimal wrapper around Keycloak Admin REST API for user/role operations."""

    def __init__(self):
        """Initialize Keycloak admin connection settings from Django config."""
        self.base_url = settings.KEYCLOAK_SERVER_URL.rstrip("/")
        self.realm = settings.KEYCLOAK_REALM
        self.admin_username = settings.KEYCLOAK_ADMIN_USERNAME
        self.admin_password = settings.KEYCLOAK_ADMIN_PASSWORD

    def _request(self, method, url, **kwargs):
        """Execute an HTTP request and normalize non-2xx responses as exceptions."""
        response = requests.request(method, url, timeout=20, **kwargs)
        if response.status_code >= 400:
            raise KeycloakAdminError(
                f"Keycloak admin request failed: {response.status_code} {response.text}"
            )
        return response

    def _token(self):
        """Obtain an admin access token via the master realm admin-cli client."""
        response = self._request(
            "POST",
            f"{self.base_url}/realms/master/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": "admin-cli",
                "username": self.admin_username,
                "password": self.admin_password,
            },
        )
        return response.json()["access_token"]

    def _headers(self):
        """Build authorization headers for admin API calls."""
        return {
            "Authorization": f"Bearer {self._token()}",
            "Content-Type": "application/json",
        }

    def create_user(self, *, username, email, first_name="", last_name="", password=None):
        """Create a Keycloak user and optionally set an initial temporary password."""
        headers = self._headers()
        payload = {
            "username": username,
            "email": email,
            "firstName": first_name,
            "lastName": last_name,
            "enabled": True,
            "emailVerified": True,
        }
        self._request(
            "POST",
            f"{self.base_url}/admin/realms/{self.realm}/users",
            headers=headers,
            json=payload,
        )
        user = self.get_user_by_username(username)

        if password:
            self.set_password(user["id"], password, temporary=True)

        return user

    def get_user_by_username(self, username):
        """Find one Keycloak user by exact username or raise if not found."""
        response = self._request(
            "GET",
            f"{self.base_url}/admin/realms/{self.realm}/users",
            headers=self._headers(),
            params={"username": username, "exact": "true"},
        )
        users = response.json()
        if not users:
            raise KeycloakAdminError(f"Keycloak user not found: {username}")
        return users[0]

    def set_password(self, keycloak_user_id, password, temporary=True):
        """Reset a Keycloak user's password."""
        self._request(
            "PUT",
            f"{self.base_url}/admin/realms/{self.realm}/users/{keycloak_user_id}/reset-password",
            headers=self._headers(),
            json={"type": "password", "value": password, "temporary": temporary},
        )

    def update_user(self, keycloak_user_id, *, email=None, first_name=None, last_name=None, enabled=None):
        """Update selected user profile fields in Keycloak."""
        payload = {}
        if email is not None:
            payload["email"] = email
            payload["emailVerified"] = True
        if first_name is not None:
            payload["firstName"] = first_name
        if last_name is not None:
            payload["lastName"] = last_name
        if enabled is not None:
            payload["enabled"] = enabled

        self._request(
            "PUT",
            f"{self.base_url}/admin/realms/{self.realm}/users/{keycloak_user_id}",
            headers=self._headers(),
            json=payload,
        )

    def get_realm_role(self, role_name):
        """Return a realm role payload by name."""
        response = self._request(
            "GET",
            f"{self.base_url}/admin/realms/{self.realm}/roles/{role_name}",
            headers=self._headers(),
        )
        return response.json()

    def create_realm_role(self, role_name, description=""):
        """Create a realm role when missing; return existing role otherwise."""
        response = requests.get(
            f"{self.base_url}/admin/realms/{self.realm}/roles/{role_name}",
            headers=self._headers(),
            timeout=20,
        )
        if response.status_code == 200:
            return response.json()
        if response.status_code != 404:
            raise KeycloakAdminError(
                f"Keycloak role check failed: {response.status_code} {response.text}"
            )

        self._request(
            "POST",
            f"{self.base_url}/admin/realms/{self.realm}/roles",
            headers=self._headers(),
            json={"name": role_name, "description": description},
        )
        return self.get_realm_role(role_name)

    def replace_realm_roles(self, keycloak_user_id, role_names):
        """Replace non-default realm roles for a user with the provided role names."""
        headers = self._headers()
        current = self._request(
            "GET",
            f"{self.base_url}/admin/realms/{self.realm}/users/{keycloak_user_id}/role-mappings/realm",
            headers=headers,
        ).json()

        removable = [
            role
            for role in current
            if role.get("name")
            and not role["name"].startswith("default-roles-")
            and role["name"] not in {"offline_access", "uma_authorization"}
        ]
        if removable:
            self._request(
                "DELETE",
                f"{self.base_url}/admin/realms/{self.realm}/users/{keycloak_user_id}/role-mappings/realm",
                headers=headers,
                json=removable,
            )

        roles = [self.get_realm_role(role_name) for role_name in role_names]
        if roles:
            self._request(
                "POST",
                f"{self.base_url}/admin/realms/{self.realm}/users/{keycloak_user_id}/role-mappings/realm",
                headers=headers,
                json=roles,
            )
