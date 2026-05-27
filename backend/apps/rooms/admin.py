from django.contrib import admin

from .models import Room, RoomType


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "base_occupancy", "max_occupancy", "is_active")
    search_fields = ("name", "code")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("number", "room_type", "branch", "floor", "status", "is_active")
    list_filter = ("status", "room_type", "branch", "is_active")
    search_fields = ("number", "floor")
