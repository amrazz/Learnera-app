from django.urls import path
from .views import *


urlpatterns = [
    path("user_login/", UserLoginView.as_view(), name="user-login"),
    path("user_logout/", LogoutView.as_view(), name="user-logout"),
    path(
        "set-password/<uidb64>/<token>/", SetPasswordView.as_view(), name="set-password"
    ),
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("forgot-password/", ForgetPasswordView.as_view(), name="forgot-password"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path(
        "reset-password-confirm/",
        ResetPasswordConfirmView.as_view(),
        name="reset-password-confirm",
    ),
    path("check-email/", CheckEmailExistsView.as_view(), name="check-email"),
    path("resend-otp/", ResendOtpView.as_view(), name="resend-otp"),
]
