from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from threading import Thread

class EmailService:    
    @staticmethod
    def send_async_email(subject, html_message, recipient_list, reply_to=None):
        plain_message = strip_tags(html_message)
        
        def send_email_task():
            try:
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=recipient_list,
                    reply_to=[reply_to] if reply_to else None
                )
                email.attach_alternative(html_message, "text/html")
                email.send(fail_silently=False)
                print(f"Email sent successfully to {', '.join(recipient_list)}")
                return True
            except Exception as e:
                print(f"Failed to send email to {', '.join(recipient_list)}: {str(e)}")
                return False

        email_thread = Thread(target=send_email_task)
        email_thread.daemon = True
        email_thread.start()
        return email_thread

    @staticmethod
    def send_welcome_email(user_type, email, username, password):

        subject_mapping = {
            "student": "Welcome to Learnera - Your Student Account Details",
            "teacher": "Welcome to Learnera - Your Teacher Account Details",
            "parent": "Welcome to Learnera - Your Parent Account Details",
        }
        
        if user_type not in subject_mapping:
            print(f"Invalid user type: {user_type}")
            return None
            
        context = {
            'username': username,
            'password': password,  
            'user_type': user_type,
            'app_name': 'Learnera',
            'login_url': settings.LOGIN_URL,
        }
        
        try:
            html_message = render_to_string('emails/welcome_email.html', context)
            return EmailService.send_async_email(
                subject=subject_mapping[user_type],
                html_message=html_message,
                recipient_list=[email]
            )
        except Exception as e:
            print(f"Failed to prepare welcome email for {email}: {str(e)}")
            return None