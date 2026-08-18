from django.test import TestCase
from django.utils import timezone
from model_bakery import baker

from apps.users.models import UserIdentity
from apps.users.utils import (
    get_user_by_identifier,
    get_user_display_name,
    get_user_sub_identifiers,
    parse_date_range_bounds,
)


class UserUtilsTests(TestCase):
    def setUp(self):
        self.user = baker.make(
            UserIdentity,
            keycloak_sub="sub-abc-123",
            username="john_doe",
            email="john@example.com",
            first_name="John",
            last_name="Doe",
        )

    def test_get_user_sub_identifiers(self):
        identifiers = get_user_sub_identifiers(self.user)
        self.assertEqual(identifiers, ["sub-abc-123", "john_doe", "john@example.com"])

    def test_get_user_display_name(self):
        self.assertEqual(get_user_display_name(self.user), "John Doe")

    def test_get_user_by_identifier(self):
        self.assertEqual(get_user_by_identifier(str(self.user.id)), self.user)
        self.assertEqual(get_user_by_identifier("sub-abc-123"), self.user)
        self.assertEqual(get_user_by_identifier("john_doe"), self.user)

    def test_parse_date_range_bounds(self):
        now = timezone.now()
        start, end = parse_date_range_bounds("today", now=now)
        self.assertEqual(start.hour, 0)
        self.assertEqual(end, now)
