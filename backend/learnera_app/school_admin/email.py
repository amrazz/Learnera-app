from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_welcome_main(user_type, email, username, password):
    subject = {
        "student": "Welcome to Learnera - Your Student Account Details",
        "teacher": "Welcome to Learnera - Your Teacher Account Details",
        "parent": "Welcome to Learnera - Your Parent Account Details",
    }
    
    context = {
        'username' : username,
        'password' : password,
        'user_type': user_type,
        'app_name' : 'Learnera'
    }    
    
    html_message = render_to_string('emails/welcome_email.html', context)
    plain_message = render_to_string('emails/welcome_email.txt', context)
    
    
    send_mail(
        subject= subject[user_type],
        message=plain_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False
    )
    
    
