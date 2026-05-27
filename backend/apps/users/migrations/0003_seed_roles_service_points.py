from django.db import migrations


def seed_roles_and_service_points(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    ServicePoint = apps.get_model("users", "ServicePoint")

    roles = [
        {
            "key": "POS_MANAGER",
            "name": "POS Manager",
            "description": "Can manage POS operations, users, roles, service points, and approvals.",
            "permissions": [
                "users.manage",
                "roles.manage",
                "service_points.manage",
                "pos.void_items",
                "reports.view",
            ],
        },
        {
            "key": "WAITER",
            "name": "Waiter",
            "description": "Can operate assigned service points and create guest orders.",
            "permissions": ["orders.create", "orders.view", "payments.request"],
        },
        {
            "key": "NAIROBI_BRANCH",
            "name": "Nairobi Branch",
            "description": "Branch scope role for Nairobi operations.",
            "permissions": ["branch.nairobi"],
        },
    ]

    for role in roles:
        Role.objects.update_or_create(
            key=role["key"],
            defaults={
                "name": role["name"],
                "description": role["description"],
                "permissions": role["permissions"],
                "sync_to_keycloak": True,
                "is_active": True,
            },
        )

    service_points = [
        {
            "name": "Main Frontdesk",
            "code": "main-frontdesk",
            "kind": "FRONTDESK",
            "location": "Reception lobby",
        },
        {
            "name": "Pool Bar POS",
            "code": "pool-bar-pos",
            "kind": "BAR",
            "location": "Pool bar",
        },
        {
            "name": "Restaurant POS",
            "code": "restaurant-pos",
            "kind": "RESTAURANT",
            "location": "Main restaurant",
        },
        {
            "name": "Metal Works Desk",
            "code": "metal-works-desk",
            "kind": "WORKSHOP",
            "location": "Workshop",
        },
    ]

    for service_point in service_points:
        ServicePoint.objects.update_or_create(
            code=service_point["code"],
            defaults={
                "name": service_point["name"],
                "kind": service_point["kind"],
                "location": service_point["location"],
                "is_active": True,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_role_servicepoint"),
    ]

    operations = [
        migrations.RunPython(seed_roles_and_service_points, migrations.RunPython.noop),
    ]
