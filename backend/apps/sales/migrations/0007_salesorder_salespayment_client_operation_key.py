from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0006_salesinvoice_receipt_file"),
    ]

    operations = [
        migrations.AddField(
            model_name="salesorder",
            name="client_operation_key",
            field=models.CharField(blank=True, max_length=120, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="salespayment",
            name="client_operation_key",
            field=models.CharField(blank=True, max_length=120, null=True, unique=True),
        ),
    ]
