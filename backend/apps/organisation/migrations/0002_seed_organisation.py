from django.db import migrations


def seed_organisation(apps, schema_editor):
    Organization = apps.get_model("organisation", "Organization")
    Branch = apps.get_model("organisation", "Branch")

    org, _ = Organization.objects.update_or_create(
        code="g8-yacht-villa",
        defaults={
            "name": "G8 Yacht Villa",
            "legal_name": "G8 Yacht Villa Limited",
            "taxpayer_pin": "P000000000X",
            "business_email": "admin@g8-yacht.local",
            "business_phone": "+254700000000",
            "physical_address": "Nairobi, Kenya",
            "is_active": True,
        },
    )

    Branch.objects.update_or_create(
        code="nairobi",
        defaults={
            "organization": org,
            "name": "Nairobi City Hotel",
            "branch_type": "CITY_HOTEL",
            "location": "Nairobi CBD",
            "kra_pin": "P000000000X",
            "is_headquarters": True,
            "is_active": True,
        },
    )
    Branch.objects.update_or_create(
        code="naivasha",
        defaults={
            "organization": org,
            "name": "Naivasha Lake Resort",
            "branch_type": "RESORT",
            "location": "Naivasha",
            "kra_pin": "P000000001Y",
            "is_headquarters": False,
            "is_active": True,
        },
    )


def reverse_seed(apps, schema_editor):
    Organization = apps.get_model("organisation", "Organization")
    Organization.objects.filter(code="g8-yacht-villa").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("organisation", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_organisation, reverse_seed),
    ]
