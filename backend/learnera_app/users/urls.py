from django.urls import path
from .views import SendOTPView, UserLoginView, LogoutView, VerifyOTPView


urlpatterns = [
    path("user_login/", UserLoginView.as_view(), name="user-login"),
    path("user_logout/", LogoutView.as_view(), name="user-logout"),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
]
