"""
ASGI config for learnera_app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.conf import settings
from django.conf.urls.static import static
import django

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'learnera_app.settings')

# Initialize Django (loads the app registry)
django.setup()

# Import websocket_urlpatterns AFTER Django setup
from chat.routing import websocket_urlpatterns

django_asgi_app = get_asgi_application()

# Define the ASGI application with protocol routing
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})