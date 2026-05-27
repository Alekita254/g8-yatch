from django.db import models


class RoomType(models.Model):
    name = models.CharField(max_length=120)
    code = models.SlugField(max_length=80, unique=True)
    base_occupancy = models.PositiveIntegerField(default=1)
    max_occupancy = models.PositiveIntegerField(default=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Room(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        OCCUPIED = "OCCUPIED", "Occupied"
        DIRTY = "DIRTY", "Dirty"
        MAINTENANCE_BLOCK = "MAINTENANCE_BLOCK", "Maintenance Block"
        OUT_OF_ORDER = "OUT_OF_ORDER", "Out of Order"

    branch = models.ForeignKey("organisation.Branch", related_name="rooms", null=True, blank=True, on_delete=models.PROTECT)
    room_type = models.ForeignKey(RoomType, related_name="rooms", on_delete=models.PROTECT)
    number = models.CharField(max_length=40, unique=True)
    floor = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.AVAILABLE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return self.number
