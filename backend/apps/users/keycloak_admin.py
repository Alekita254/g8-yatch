import requests
from django.conf import settings


class KeycloakAdminError(RuntimeError):
    pass


class KeycloakAdminClient:
    def __init__(self):
        self.base_url = settings.KEYCLOAK_SERVER_URL.rstrip("/")
        self.realm = settings.KEYCLOAK_REALM
        self.admin_username = settings.KEYCLOAK_ADMIN_USERNAME
        self.admin_password = settings.KEYCLOAK_ADMIN_PASSWORD

    def _request(self, method, url, **kwargs):
        response = requests.request(method, url, timeout=20, **kwargs)
        if response.status_code >= 400:
            raise KeycloakAdminError(
                f"Keycloak admin request failed: {response.status_code} {response.text}"
            )
        return response

    def _token(self):
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
        return {
            "Authorization": f"Bearer {self._token()}",
            "Content-Type": "application/json",
        }

    def create_user(self, *, username, email, first_name="", last_name="", password=None):
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
        self._request(
            "PUT",
            f"{self.base_url}/admin/realms/{self.realm}/users/{keycloak_user_id}/reset-password",
            headers=self._headers(),
            json={"type": "password", "value": password, "temporary": temporary},
        )

    def get_realm_role(self, role_name):
        response = self._request(
            "GET",
            f"{self.base_url}/admin/realms/{self.realm}/roles/{role_name}",
            headers=self._headers(),
        )
        return response.json()

    def create_realm_role(self, role_name, description=""):
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
