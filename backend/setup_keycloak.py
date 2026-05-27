"""
Create the Keycloak realm, SPA client, roles, and a development user.

Usage:
    python setup_keycloak.py

Optional environment variables:
    KEYCLOAK_SERVER_URL=http://localhost:8080
    KEYCLOAK_ADMIN_USERNAME=admin
    KEYCLOAK_ADMIN_PASSWORD=admin
    KEYCLOAK_REALM=g8-yacht
    KEYCLOAK_AUDIENCE=pos-terminal
    KEYCLOAK_DEV_USERNAME=manager
    KEYCLOAK_DEV_PASSWORD=manager123
"""

import os
from pathlib import Path

import requests


BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file(ENV_FILE)

KEYCLOAK_SERVER_URL = os.environ.get("KEYCLOAK_SERVER_URL", "http://localhost:8080").rstrip("/")
ADMIN_USERNAME = os.environ.get("KEYCLOAK_ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("KEYCLOAK_ADMIN_PASSWORD", "admin")
REALM = os.environ.get("KEYCLOAK_REALM", "g8-yacht")
CLIENT_ID = os.environ.get("KEYCLOAK_AUDIENCE", "pos-terminal")
DEV_USERNAME = os.environ.get("KEYCLOAK_DEV_USERNAME", "manager")
DEV_PASSWORD = os.environ.get("KEYCLOAK_DEV_PASSWORD", "manager123")

REDIRECT_URIS = [
    "http://localhost:5173/*",
    "http://localhost:5174/*",
    "http://127.0.0.1:5173/*",
    "http://127.0.0.1:5174/*",
]
WEB_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
REALM_ROLES = ["POS_MANAGER", "WAITER", "NAIROBI_BRANCH"]


class KeycloakSetupError(RuntimeError):
    pass


def request(method: str, url: str, **kwargs):
    response = requests.request(method, url, timeout=20, **kwargs)
    if response.status_code >= 400:
        raise KeycloakSetupError(f"{method} {url} failed: {response.status_code} {response.text}")
    return response


def get_admin_token() -> str:
    url = f"{KEYCLOAK_SERVER_URL}/realms/master/protocol/openid-connect/token"
    data = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD,
    }
    return request("POST", url, data=data).json()["access_token"]


def auth_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def create_realm(token: str) -> None:
    headers = auth_headers(token)
    realm_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}"
    response = requests.get(realm_url, headers=headers, timeout=20)

    if response.status_code == 200:
        print(f"Realm exists: {REALM}")  # noqa: T201
        return

    if response.status_code != 404:
        raise KeycloakSetupError(f"Realm check failed: {response.status_code} {response.text}")

    request(
        "POST",
        f"{KEYCLOAK_SERVER_URL}/admin/realms",
        headers=headers,
        json={"realm": REALM, "enabled": True},
    )
    print(f"Realm created: {REALM}")  # noqa: T201


def get_client(token: str):
    headers = auth_headers(token)
    url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/clients"
    response = request("GET", url, headers=headers, params={"clientId": CLIENT_ID})
    clients = response.json()
    return clients[0] if clients else None


def create_or_update_client(token: str) -> str:
    headers = auth_headers(token)
    client = get_client(token)
    payload = {
        "clientId": CLIENT_ID,
        "name": "POS Terminal",
        "enabled": True,
        "protocol": "openid-connect",
        "publicClient": True,
        "standardFlowEnabled": True,
        "directAccessGrantsEnabled": False,
        "redirectUris": REDIRECT_URIS,
        "webOrigins": WEB_ORIGINS,
        "attributes": {
            "pkce.code.challenge.method": "S256",
        },
    }

    if client:
        request(
            "PUT",
            f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/clients/{client['id']}",
            headers=headers,
            json={**client, **payload},
        )
        print(f"Client updated: {CLIENT_ID}")  # noqa: T201
        return client["id"]

    request(
        "POST",
        f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/clients",
        headers=headers,
        json=payload,
    )
    client = get_client(token)
    print(f"Client created: {CLIENT_ID}")  # noqa: T201
    return client["id"]


def create_role(token: str, role_name: str) -> None:
    headers = auth_headers(token)
    role_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/roles/{role_name}"
    response = requests.get(role_url, headers=headers, timeout=20)

    if response.status_code == 200:
        print(f"Role exists: {role_name}")  # noqa: T201
        return

    if response.status_code != 404:
        raise KeycloakSetupError(f"Role check failed: {response.status_code} {response.text}")

    request(
        "POST",
        f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/roles",
        headers=headers,
        json={"name": role_name},
    )
    print(f"Role created: {role_name}")  # noqa: T201


def create_audience_mapper(token: str, client_uuid: str) -> None:
    headers = auth_headers(token)
    mappers_url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/clients/{client_uuid}/protocol-mappers/models"
    response = request("GET", mappers_url, headers=headers)
    existing = [mapper for mapper in response.json() if mapper.get("name") == f"{CLIENT_ID}-audience"]

    payload = {
        "name": f"{CLIENT_ID}-audience",
        "protocol": "openid-connect",
        "protocolMapper": "oidc-audience-mapper",
        "config": {
            "included.client.audience": CLIENT_ID,
            "access.token.claim": "true",
            "id.token.claim": "false",
        },
    }

    if existing:
        request("PUT", f"{mappers_url}/{existing[0]['id']}", headers=headers, json={**existing[0], **payload})
        print(f"Audience mapper exists: {CLIENT_ID}")  # noqa: T201
        return

    request("POST", mappers_url, headers=headers, json=payload)
    print(f"Audience mapper created: {CLIENT_ID}")  # noqa: T201


def get_user(token: str):
    headers = auth_headers(token)
    url = f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/users"
    response = request("GET", url, headers=headers, params={"username": DEV_USERNAME, "exact": "true"})
    users = response.json()
    return users[0] if users else None


def create_or_update_dev_user(token: str) -> str:
    headers = auth_headers(token)
    user = get_user(token)
    payload = {
        "username": DEV_USERNAME,
        "email": f"{DEV_USERNAME}@g8-yacht.local",
        "firstName": "POS",
        "lastName": "Manager",
        "enabled": True,
        "emailVerified": True,
    }

    if user:
        request(
            "PUT",
            f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/users/{user['id']}",
            headers=headers,
            json={**user, **payload},
        )
        user_id = user["id"]
        print(f"User updated: {DEV_USERNAME}")  # noqa: T201
    else:
        request("POST", f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/users", headers=headers, json=payload)
        user_id = get_user(token)["id"]
        print(f"User created: {DEV_USERNAME}")  # noqa: T201

    request(
        "PUT",
        f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/users/{user_id}/reset-password",
        headers=headers,
        json={"type": "password", "value": DEV_PASSWORD, "temporary": False},
    )
    print(f"Password set for: {DEV_USERNAME}")  # noqa: T201
    return user_id


def assign_roles(token: str, user_id: str, role_names: list[str]) -> None:
    headers = auth_headers(token)
    roles = []

    for role_name in role_names:
        response = request(
            "GET",
            f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/roles/{role_name}",
            headers=headers,
        )
        roles.append(response.json())

    request(
        "POST",
        f"{KEYCLOAK_SERVER_URL}/admin/realms/{REALM}/users/{user_id}/role-mappings/realm",
        headers=headers,
        json=roles,
    )
    print(f"Roles assigned to {DEV_USERNAME}: {', '.join(role_names)}")  # noqa: T201


def main() -> None:
    print(f"Keycloak URL: {KEYCLOAK_SERVER_URL}")  # noqa: T201
    print(f"Realm: {REALM}")  # noqa: T201
    print(f"Client: {CLIENT_ID}")  # noqa: T201

    token = get_admin_token()
    create_realm(token)
    client_uuid = create_or_update_client(token)

    for role_name in REALM_ROLES:
        create_role(token, role_name)

    create_audience_mapper(token, client_uuid)
    user_id = create_or_update_dev_user(token)
    assign_roles(token, user_id, ["POS_MANAGER", "NAIROBI_BRANCH"])

    print("Keycloak setup complete")  # noqa: T201
    print(f"Dev login: {DEV_USERNAME} / {DEV_PASSWORD}")  # noqa: T201


if __name__ == "__main__":
    main()
