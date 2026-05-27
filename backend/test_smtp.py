import os
import django
from django.core.mail import send_mail
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()



print("=========================================")
print("🚀 TenderSafi SMTP Connection Diagnostic")
print("=========================================")
print(f"SMTP Server: {getattr(settings, 'EMAIL_HOST', 'Not Configured')}")
print(f"SMTP Port:   {getattr(settings, 'EMAIL_PORT', 'Not Configured')}")
print(f"Sender:      {getattr(settings, 'DEFAULT_FROM_EMAIL', 'Not Configured')}")
print(f"Target:      {getattr(settings, 'EMAIL_HOST_USER', 'Not Configured')}")
print("-----------------------------------------")
print("Connecting to mail server and sending test...")

try:
    send_mail(
        subject="TenderSafi SMTP Verification Check",
        message=(
            "Hello Developer!\n\n"
            "Congratulations! Your local .env secrets are verified and your Django SMTP configuration "
            "is perfectly functional. You are ready to start sending transactional onboarding emails!\n\n"
            "Regards,\n"
            "TenderSafi Systems Engine"
        ),
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', settings.EMAIL_HOST_USER),
        recipient_list=[settings.EMAIL_HOST_USER], # Dispatches test straight to yourself!
        fail_silently=False
    )
    print("\n✅ SUCCESS! Connection established. Check your inbox for the test mail!")
    print("=========================================")
except Exception as e:
    print("\n❌ SMTP TEST FAILED!")
    print(f"Diagnostic Error Code: {e}")
    print("\n💡 Double check:")
    print("1. Did you create your '.env' from the template?")
    print("2. If using Gmail, did you use a 16-character 'App Password' instead of your primary password?")
    print("3. Ensure 2-Step Verification is active on your Google account.")
    print("=========================================")
