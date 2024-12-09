from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserLoginView, UserRegisterView


urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name='get_token'),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("user_register/", UserRegisterView.as_view(), name="user_register"),
    path("user_login/", UserLoginView.as_view(), name="user_login")
]
