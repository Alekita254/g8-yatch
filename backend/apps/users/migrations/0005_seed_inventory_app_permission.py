from django.db import migrations


def seed_inventory_app_permission(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    role = Role.objects.filter(key="POS_MANAGER").first()
    if not role:
        return

    permissions = list(role.permissions or [])
    if "app.inventory" not in permissions:
        permissions.append("app.inventory")
        role.permissions = permissions
        role.save(update_fields=["permissions", "updated_at"])


def unseed_inventory_app_permission(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    for role in Role.objects.all():
        role.permissions = [
            permission
            for permission in (role.permissions or [])
            if permission != "app.inventory"
        ]
        role.save(update_fields=["permissions", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0004_seed_app_permissions"),
    ]

    operations = [
        migrations.RunPython(seed_inventory_app_permission, unseed_inventory_app_permission),
    ]
