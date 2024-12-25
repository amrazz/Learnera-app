from django.urls import path
from .views import UserLoginView, LogoutView


urlpatterns = [
    path("user_login/", UserLoginView.as_view(), name="user-login"),
    path("user_logout/", LogoutView.as_view(), name="user-logout"),
]
