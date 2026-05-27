from django.db import migrations


def seed_payments(apps, schema_editor):
    PaymentMethod = apps.get_model("payments", "PaymentMethod")
    BankAccount = apps.get_model("payments", "BankAccount")
    PaymentRoutingRule = apps.get_model("payments", "PaymentRoutingRule")

    cash, _ = PaymentMethod.objects.update_or_create(
        code="cash",
        defaults={
            "name": "Cash",
            "method_type": "CASH",
            "opens_cash_drawer": True,
            "requires_reference": False,
            "is_active": True,
        },
    )
    mpesa, _ = PaymentMethod.objects.update_or_create(
        code="lipa-na-mpesa",
        defaults={
            "name": "Lipa na M-Pesa",
            "method_type": "MPESA",
            "requires_reference": True,
            "is_active": True,
        },
    )
    city_ledger, _ = PaymentMethod.objects.update_or_create(
        code="city-ledger",
        defaults={
            "name": "City Ledger",
            "method_type": "CITY_LEDGER",
            "requires_customer": True,
            "posts_to_accounts_receivable": True,
            "is_active": True,
        },
    )
    room_charge, _ = PaymentMethod.objects.update_or_create(
        code="room-charge",
        defaults={
            "name": "Room Charge",
            "method_type": "ROOM_CHARGE",
            "requires_room_verification": True,
            "is_active": True,
        },
    )

    cash_till, _ = BankAccount.objects.update_or_create(
        code="main-cash-till",
        defaults={
            "name": "Main Cash Till",
            "account_type": "CASH_TILL",
            "ledger_account": "Cash on Hand - Main Till",
            "currency": "KES",
            "is_active": True,
        },
    )
    spa_mpesa, _ = BankAccount.objects.update_or_create(
        code="spa-mpesa-clearing",
        defaults={
            "name": "Spa M-Pesa Clearing",
            "account_type": "MPESA_TILL",
            "till_number": "888999",
            "ledger_account": "M-Pesa Clearing - Spa",
            "currency": "KES",
            "is_active": True,
        },
    )
    ar_ledger, _ = BankAccount.objects.update_or_create(
        code="city-ledger-ar",
        defaults={
            "name": "City Ledger Accounts Receivable",
            "account_type": "AR_LEDGER",
            "ledger_account": "Accounts Receivable - Corporate",
            "currency": "KES",
            "is_active": True,
        },
    )

    PaymentRoutingRule.objects.update_or_create(
        payment_method=cash,
        service_point_kind="",
        defaults={"bank_account": cash_till, "priority": 100, "is_active": True},
    )
    PaymentRoutingRule.objects.update_or_create(
        payment_method=mpesa,
        service_point_kind="SPA",
        defaults={"bank_account": spa_mpesa, "priority": 10, "is_active": True},
    )
    PaymentRoutingRule.objects.update_or_create(
        payment_method=city_ledger,
        service_point_kind="",
        defaults={"bank_account": ar_ledger, "priority": 100, "is_active": True},
    )
    PaymentRoutingRule.objects.update_or_create(
        payment_method=room_charge,
        service_point_kind="",
        defaults={"bank_account": ar_ledger, "priority": 100, "is_active": True},
    )


def reverse_seed(apps, schema_editor):
    PaymentMethod = apps.get_model("payments", "PaymentMethod")
    BankAccount = apps.get_model("payments", "BankAccount")
    PaymentMethod.objects.filter(code__in=["cash", "lipa-na-mpesa", "city-ledger", "room-charge"]).delete()
    BankAccount.objects.filter(code__in=["main-cash-till", "spa-mpesa-clearing", "city-ledger-ar"]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_payments, reverse_seed),
    ]
