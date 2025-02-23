from django.urls import path
from .views import ChangePasswordView, SendOTPView, UserLoginView, LogoutView, UserProfileView, VerifyOTPView, PasswordChangeView


urlpatterns = [
    path("user_login/", UserLoginView.as_view(), name="user-login"),
    path("user_logout/", LogoutView.as_view(), name="user-logout"),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', ChangePasswordView.as_view(), name='reset-password'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
]
