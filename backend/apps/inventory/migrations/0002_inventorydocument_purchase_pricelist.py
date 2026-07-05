import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("inventory", "0001_initial"),
        ("products", "0007_salespricelist_service_points"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventorydocument",
            name="purchase_pricelist",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="inventory_documents",
                to="products.purchasepricelist",
            ),
        ),
    ]
