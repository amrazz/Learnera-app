from django.urls import path
from .views import *


urlpatterns = [
    path("user_login/", UserLoginView.as_view(), name="user-login"),
    path("user_logout/", LogoutView.as_view(), name="user-logout"),
    path('set-password/<uidb64>/<token>/', SetPasswordView.as_view(), name='set-password'),
    path('reset-password/', ChangePasswordView.as_view(), name='reset-password'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
]
