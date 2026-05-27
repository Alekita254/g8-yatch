from django.db import migrations


def seed_taxes_discounts(apps, schema_editor):
    TaxConfiguration = apps.get_model("taxes", "TaxConfiguration")
    TaxCategory = apps.get_model("taxes", "TaxCategory")
    TaxOffice = apps.get_model("taxes", "TaxOffice")
    DiscountRule = apps.get_model("taxes", "DiscountRule")

    vat, _ = TaxConfiguration.objects.update_or_create(
        code="vat-16",
        defaults={
            "name": "VAT 16%",
            "rate": 16,
            "calculation_type": "PERCENTAGE",
            "application_order": 30,
            "ledger_account": "VAT Output Payable",
            "is_active": True,
        },
    )
    service_charge, _ = TaxConfiguration.objects.update_or_create(
        code="service-charge-10",
        defaults={
            "name": "Service Charge 10%",
            "rate": 10,
            "calculation_type": "PERCENTAGE",
            "application_order": 10,
            "ledger_account": "Service Charge Liability",
            "is_active": True,
        },
    )
    catering_levy, _ = TaxConfiguration.objects.update_or_create(
        code="catering-levy-2",
        defaults={
            "name": "Catering Levy 2%",
            "rate": 2,
            "calculation_type": "PERCENTAGE",
            "application_order": 20,
            "ledger_account": "Tourism Levy Payable",
            "is_active": True,
        },
    )

    standard, _ = TaxCategory.objects.update_or_create(
        code="A",
        defaults={
            "name": "Standard Rated",
            "etims_code": "A",
            "description": "KRA/eTIMS standard-rated items.",
            "is_default": True,
            "is_active": True,
        },
    )
    standard.taxes.set([service_charge, catering_levy, vat])

    zero, _ = TaxCategory.objects.update_or_create(
        code="B",
        defaults={
            "name": "Zero Rated",
            "etims_code": "B",
            "description": "KRA/eTIMS zero-rated items.",
            "is_active": True,
        },
    )
    zero.taxes.clear()

    exempt, _ = TaxCategory.objects.update_or_create(
        code="C",
        defaults={
            "name": "Exempt",
            "etims_code": "C",
            "description": "KRA/eTIMS exempt items.",
            "is_active": True,
        },
    )
    exempt.taxes.clear()

    TaxOffice.objects.update_or_create(
        branch_code="NAIROBI",
        kra_pin="P000000000X",
        defaults={
            "name": "Nairobi Tax Office",
            "integration_mode": "CLOUD_ETIMS",
            "endpoint_url": "",
            "routing_key": "nairobi-cloud",
            "certificate_alias": "nairobi-etims-cert",
            "is_active": True,
        },
    )

    DiscountRule.objects.update_or_create(
        code="happy-hour-10",
        defaults={
            "name": "Happy Hour 10%",
            "discount_type": "PERCENTAGE",
            "value": 10,
            "requires_approval": False,
            "service_point_kinds": ["BAR", "RESTAURANT"],
            "is_active": True,
        },
    )
    DiscountRule.objects.update_or_create(
        code="staff-welfare-50",
        defaults={
            "name": "Staff Welfare 50%",
            "discount_type": "PERCENTAGE",
            "value": 50,
            "requires_approval": True,
            "allowed_roles": ["POS_MANAGER"],
            "is_active": True,
        },
    )


def reverse_seed(apps, schema_editor):
    TaxConfiguration = apps.get_model("taxes", "TaxConfiguration")
    TaxCategory = apps.get_model("taxes", "TaxCategory")
    TaxOffice = apps.get_model("taxes", "TaxOffice")
    DiscountRule = apps.get_model("taxes", "DiscountRule")

    TaxCategory.objects.filter(code__in=["A", "B", "C"]).delete()
    TaxConfiguration.objects.filter(code__in=["vat-16", "service-charge-10", "catering-levy-2"]).delete()
    TaxOffice.objects.filter(branch_code="NAIROBI", kra_pin="P000000000X").delete()
    DiscountRule.objects.filter(code__in=["happy-hour-10", "staff-welfare-50"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("taxes", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_taxes_discounts, reverse_seed),
    ]
