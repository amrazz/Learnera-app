import random
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from loguru import logger


def generate_otp():
    return "".join([str(random.randint(0, 9)) for _ in range(4)])


def send_otp(email, otp, purpose="Verification"):
    try:
        
        subject = f"Learnera - {purpose}"
        context = {
            "otp": otp,
            "purpose": purpose,
            "app_name": "LEARNERA APP",
            "support_email": getattr(settings, "EMAIL_HOST_USER", "learnerapp999@gmail.com"),
        }

        try:
            html_message = render_to_string("emails/otp_email.html", context)
            plain_message = strip_tags(html_message)
        except:
            plain_message = f"""
Hello,

Your {purpose} OTP code is: {otp}

This OTP will expire in 10 minutes. Please use it to complete your request.

If you didn't request this OTP, please ignore this email.

Best regards,
{context['app_name']} Team

---
If you need help, contact us at {context['support_email']}
            """.strip()
            html_message = None
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'learnerapp999@gmail.com'),
                recipient_list=[email],
                html_message=html_message,
                fail_silently=False,
            )
            
            logger.info(f"OTP email sent successfully to {email}")
            return True
        
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        raise e
