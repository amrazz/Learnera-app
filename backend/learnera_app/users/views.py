from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import generate_otp, send_otp
from .models import CustomUser
from .serializers import (
    BaseUserProfileSerializer,
    ParentProfileSerializer,
    PasswordChangeSerializer,
    StudentProfileSerializer,
    TeacherProfileSerializer,
    UserLoginserializers,
)
from django.contrib.auth.hashers import check_password
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
import logging

User = get_user_model()


# --------------------------------------

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


handler = logging.FileHandler("user_views_log.log")
handler.setLevel(logging.DEBUG)


formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)

if not logger.hasHandlers():
    logger.addHandler(handler)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info("User login attempt: %s", request.data.get("username"))
        serializer = UserLoginserializers(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            logger.info("User %s login successful", user)
            role = serializer.validated_data["role"]
            user = CustomUser.objects.get(username=user)

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Login successful",
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "role": role,
                    "userEmail": user.email,
                    "resetPassword": user.reset_password,
                },
                status=status.HTTP_200_OK,
            )
        else:
            logger.warning(
                "Login failed due to validation error: %s", serializer.errors
            )
            return Response(
                {"error": "Login Failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refreshToken"]
            logger.info("Logout attempt with token: %s", refresh_token)
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout Successful"}, status=status.HTTP_205_RESET_CONTENT
            )
        except KeyError:
            logger.error("Logout failed: Refresh token is missing")
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error("Logout failed: %s", str(e))
            return Response(
                {"error": "Token is invalid or expired", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SetPasswordView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(id=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError) as e:
            logger.error("Error while setting the user password : %s", str(e))

            return Response(
                {"error": "Invalid User"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if new_password != confirm_password:
            return Response(
                {"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password set successfully"}, status=status.HTTP_200_OK
        )


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        email = request.data.get("userEmail")
        skip = request.data.get("skip", False)

        logger.info("Password change attempt for email: %s", email)
        try:
            user = CustomUser.objects.get(email=email)

            if user.reset_password:
                logger.warning("Password already changed for user: %s", email)
                return Response(
                    {"error": "Password has already been changed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if skip:
                user.reset_password = True
                user.save()
                logger.info("Password reset skipped for user: %s", email)
                return Response(
                    {"message": "Password reset skipped successfully."},
                    status=status.HTTP_200_OK,
                )

            if new_password != confirm_password:
                logger.warning("Password mismatch for user: %s", email)
                return Response(
                    {"error": "New password and confirmation do not match."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password)
            user.reset_password = True
            user.save()
            logger.info("Password changed successfully for user: %s", email)
            return Response(
                {"message": "Password changed successfully!"},
                status=status.HTTP_200_OK,
            )

        except CustomUser.DoesNotExist:
            logger.error("Password change failed: User not found with email %s", email)
            return Response(
                {"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST
            )


class BaseProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_serializer_class(self):
        user = self.request.user
        logger.debug("Determining serializer for user: %s", user)
        if user.is_teacher:
            return TeacherProfileSerializer
        elif user.is_student:
            return StudentProfileSerializer
        elif user.is_parent:
            return ParentProfileSerializer
        return BaseUserProfileSerializer


class UserProfileView(BaseProfileView):
    def get(self, request, *args, **kwargs):
        user = self.get_object()
        logger.info("Fetching profile for user: %s", user)
        serializer_class = self.get_serializer_class()
        serializer = serializer_class(user)
        data = serializer.data
        data["role"] = self.get_user_role(user)
        return Response(data)

    def get_user_role(self, user):
        if user.is_teacher:
            return "teacher"
        elif user.is_student:
            return "student"
        elif user.is_parent:
            return "parent"
        return "user"

    def patch(self, request, *args, **kwargs):
        logger.info("Updating profile for user: %s", request.user)
        kwargs["partial"] = True
        return super().patch(request, *args, **kwargs)


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logger.info("Password change request for user: %s", request.user)
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not check_password(serializer.data["current_password"], user.password):
                logger.warning("Incorrect current password for user: %s", user)
                return Response(
                    {"current_password": "Wrong password."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.data["new_password"])
            user.save()
            logger.info("Password changed successfully for user: %s", user)
            return Response({"status": "password changed successfully"})
        else:
            logger.debug("Password change validation errors: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
