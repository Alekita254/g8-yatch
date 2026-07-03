from django.db import migrations


APP_PERMISSIONS_BY_ROLE = {
    "POS_MANAGER": ["app.admin", "app.frontdesk", "app.sales", "app.accounting"],
    "WAITER": ["app.frontdesk"],
}


def seed_app_permissions(apps, schema_editor):
    Role = apps.get_model("users", "Role")

    for role_key, permissions in APP_PERMISSIONS_BY_ROLE.items():
        role = Role.objects.filter(key=role_key).first()
        if not role:
            continue

        existing = list(role.permissions or [])
        merged = [*existing]
        for permission in permissions:
            if permission not in merged:
                merged.append(permission)

        role.permissions = merged
        role.save(update_fields=["permissions", "updated_at"])


def unseed_app_permissions(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    permissions_to_remove = {
        permission
        for permissions in APP_PERMISSIONS_BY_ROLE.values()
        for permission in permissions
    }

    for role in Role.objects.all():
        role.permissions = [
            permission
            for permission in (role.permissions or [])
            if permission not in permissions_to_remove
        ]
        role.save(update_fields=["permissions", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0003_seed_roles_service_points"),
    ]

    operations = [
        migrations.RunPython(seed_app_permissions, unseed_app_permissions),
    ]
