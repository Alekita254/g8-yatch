from django.db import models


class ProductCategory(models.Model):
    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=80, unique=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.PROTECT,
    )
    tax_code = models.CharField(max_length=40, blank=True)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    ui_tab = models.CharField(max_length=80, blank=True)
    route_printer_ip = models.GenericIPAddressField(null=True, blank=True)
    route_station = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "product categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    class ProductType(models.TextChoices):
        BILLABLE = "BILLABLE", "Billable Unit"
        RAW = "RAW", "Raw Inventory"
        SERVICE = "SERVICE", "Service"

    class Unit(models.TextChoices):
        EACH = "EACH", "Each"
        KG = "KG", "Kilogram"
        G = "G", "Gram"
        L = "L", "Litre"
        ML = "ML", "Millilitre"
        HOUR = "HOUR", "Hour"

    class PackageType(models.TextChoices):
        INDIVIDUAL = "INDIVIDUAL", "Individual Item"
        DOZEN = "DOZEN", "Dozen"
        CARTON = "CARTON", "Carton"
        BALE = "BALE", "Bale"
        BAG = "BAG", "Bag"
        SACK = "SACK", "Sack"
        BOX = "BOX", "Box"
        CRATE = "CRATE", "Crate"
        BOTTLE = "BOTTLE", "Bottle"
        CAN = "CAN", "Can"
        JAR = "JAR", "Jar"
        PACK = "PACK", "Pack"

    name = models.CharField(max_length=160)
    sku = models.CharField(max_length=80, unique=True)
    product_type = models.CharField(max_length=20, choices=ProductType.choices)
    category = models.ForeignKey(
        ProductCategory,
        related_name="products",
        on_delete=models.PROTECT,
    )
    unit = models.CharField(max_length=20, choices=Unit.choices, default=Unit.EACH)
    package_type = models.CharField(
        max_length=20,
        choices=PackageType.choices,
        default=PackageType.INDIVIDUAL,
    )
    pack_size = models.DecimalField(max_digits=12, decimal_places=3, default=1)
    quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    description = models.TextField(blank=True)
    is_sellable = models.BooleanField(default=True)
    is_inventory_tracked = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class BillOfMaterialsItem(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="bom_items",
        on_delete=models.CASCADE,
    )
    component = models.ForeignKey(
        Product,
        related_name="used_in_boms",
        on_delete=models.PROTECT,
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=20, choices=Product.Unit.choices)

    class Meta:
        ordering = ["product__name", "component__name"]

    def __str__(self):
        return f"{self.product} uses {self.quantity} {self.unit} {self.component}"


class SalesPricelist(models.Model):
    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=80, unique=True)
    description = models.TextField(blank=True)
    service_point_kind = models.CharField(max_length=40, blank=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class SalesPricelistItem(models.Model):
    pricelist = models.ForeignKey(
        SalesPricelist,
        related_name="items",
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        Product,
        related_name="sales_prices",
        on_delete=models.PROTECT,
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="KES")

    class Meta:
        unique_together = [("pricelist", "product")]
        ordering = ["pricelist__name", "product__name"]

    def __str__(self):
        return f"{self.product} @ {self.price} {self.currency}"


class PurchasePricelist(models.Model):
    supplier_name = models.CharField(max_length=160)
    code = models.SlugField(max_length=80, unique=True)
    description = models.TextField(blank=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_to = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["supplier_name"]

    def __str__(self):
        return self.supplier_name


class PurchasePricelistItem(models.Model):
    pricelist = models.ForeignKey(
        PurchasePricelist,
        related_name="items",
        on_delete=models.CASCADE,
    )
    product = models.ForeignKey(
        Product,
        related_name="purchase_prices",
        on_delete=models.PROTECT,
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="KES")
    unit = models.CharField(max_length=20, choices=Product.Unit.choices)

    class Meta:
        unique_together = [("pricelist", "product")]
        ordering = ["pricelist__supplier_name", "product__name"]

    def __str__(self):
        return f"{self.product} from {self.pricelist}"
