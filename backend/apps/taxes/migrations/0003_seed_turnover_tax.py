from django.db import migrations


def seed_turnover_tax(apps, schema_editor):
    TaxConfiguration = apps.get_model("taxes", "TaxConfiguration")
    TaxConfiguration.objects.update_or_create(
        code="tot-1-5",
        defaults={
            "name": "TOT 1.5%",
            "rate": 1.5,
            "calculation_type": "PERCENTAGE",
            "application_order": 40,
            "ledger_account": "Turnover Tax Payable",
            "is_active": True,
        },
    )


def reverse_seed(apps, schema_editor):
    TaxConfiguration = apps.get_model("taxes", "TaxConfiguration")
    TaxConfiguration.objects.filter(code="tot-1-5").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("taxes", "0002_seed_taxes_discounts"),
    ]

    operations = [
        migrations.RunPython(seed_turnover_tax, reverse_seed),
    ]
