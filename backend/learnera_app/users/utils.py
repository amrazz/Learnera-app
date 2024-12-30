import random
from django.core.mail import send_mail
from django.conf import settings


def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(6)])


def send_otp(email, otp):
    subject = 'Learnera - Email Verification OTP'
    message = f'Your OTP for email verification is: {otp}\nValid for 10 minutes.'
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False
    )