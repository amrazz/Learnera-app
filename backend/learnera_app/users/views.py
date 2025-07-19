from datetime import timezone
from loguru import logger  # type: ignore
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import generate_otp, send_otp
from .serializers import (
    BaseUserProfileSerializer,
    ForgetPasswordSerializer,
    ParentProfileSerializer,
    ResetPasswordConfirmSerializer,
    StudentProfileSerializer,
    TeacherProfileSerializer,
    UserLoginserializers,
    VerifyOTPSerializer,
)
from django.contrib.auth.hashers import check_password
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.contrib.auth.hashers import check_password, make_password

User = get_user_model()


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info("User login attempt: %s", request.data.get("username"))
        serializer = UserLoginserializers(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            logger.info("User %s login successful", user)
            role = serializer.validated_data["role"]
            user = User.objects.get(username=user)

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


class ForgetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            try:
                user = User.objects.get(email=email)
                logger.info(f"Password reset OTP request for user: {user.username}")

                otp = generate_otp()

                cache_key = f"password_reset_otp_{email}"
                cache.set(cache_key, otp)

                attempt_key = f"password_reset_attempts_{email}"
                attempt = cache.set(attempt_key, 0)
                
                if not attempt:
                    attempt = 0

                if attempt >= 5:
                    logger.warning(
                        f"To many password reset attemps for email : {email}"
                    )
                    return Response(
                        {"error": "Too many attempts. Please try again later."},
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )
                cache.set(attempt_key, attempt + 1, timeout=3600)

                try:
                    send_otp(email, otp, "Password Reset")
                    logger.info(f"Password reset OTP send successfully to : {email} ")

                    return Response(
                        {
                            "message": "OTP sent successfully to your email",
                            "email": email,
                        },
                        status=status.HTTP_200_OK,
                    )

                except Exception as e:
                    logger.error("Failed to send OTP email to %s: %s", email, str(e))
                    return Response(
                        {"error": "Failed to send OTP. Please try again."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            except User.DoesNotExist:
                logger.warning("Password reset attempted for non-existent email")
                return Response(
                    {
                        "message": "User with email does not exists",
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"error": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]
            
            logger.debug(f"This is the verify data OTP - {otp}, email")

            logger.info(f"OTP verification attempt for email: {email}")

            cache_key = f"password_reset_otp_{email}"
            stored_otp = cache.get(cache_key)

            if not stored_otp:
                logger.warning(f"OTP expired or not found.")
                return Response(
                    {"error": "OTP has expired. Please request a new one."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if str(stored_otp) != str(otp):
                logger.warning("Invalid OTP provided for email: %s", email)
                return Response(
                    {"error": "Invalid OTP. Please try again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            verification_key = f"otp_verified_{email}"
            cache.set(verification_key, True, 900)

            logger.info("OTP verified successfully for email: %s", email)
            return Response(
                {
                    "message": "OTP verified successfully",
                    "email": email,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ResetPasswordConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]
            new_password = serializer.validated_data["new_password"]

            logger.info("Password reset confirmation for email: %s", email)

            verification_key = f"otp_verified_{email}"
            is_verified = cache.get(verification_key)

            if not is_verified:
                logger.warning(
                    "Attempting password reset without OTP verification: %s", email
                )
                return Response(
                    {"error": "OTP verification required. Please verify OTP first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cache_key = f"password_reset_otp_{email}"
            stored_otp = cache.get(cache_key)

            if not stored_otp or str(stored_otp) != str(otp):
                logger.warning(
                    "OTP expired or invalid during password reset: %s", email
                )
                return Response(
                    {
                        "error": "OTP has expired or is invalid. Please start the process again."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                user = User.objects.get(email=email)
                if len(new_password) < 6:
                    return Response(
                        {"error": "Password must be at least 6 characters long."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if check_password(new_password, user.password):
                    return Response(
                        {"error": "New password must be different from your current password."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                user.set_password(new_password)
                user.save()

                cache.delete(cache_key)  
                cache.delete(verification_key)  
                cache.delete(
                    f"password_reset_attempts_{email}"
                ) 

                logger.success("Password reset successful for user: %s", email)

                return Response(
                    {
                        "message": "Password reset successful! You can now login with your new password.",
                        "email": email,
                    },
                    status=status.HTTP_200_OK,
                )

            except User.DoesNotExist:
                logger.warning(
                    "Password reset attempted for non-existent user: %s", email
                )
                return Response(
                    {"error": "User not found. Please check your email address."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception as e:
                logger.error("Error during password reset for %s: %s", email, str(e))
                return Response(
                    {
                        "error": "An error occurred while resetting your password. Please try again."
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

class CheckEmailExistsView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
            return Response(
                {"exists": True, "message": "Email found"},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            return Response(
                {
                    "exists": False,
                    "message": "This email does not exists.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )


class ResendOtpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        attempt_key = f"password_reset_attempts_{email}"
        attempts = cache.get(attempt_key, 0)

        if attempts >= 5:
            logger.warning("Too many OTP resend attempts for email: %s", email)
            return Response(
                {"error": "Too many attempts. Please try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            user = User.objects.get(email=email)

            otp = generate_otp()

            cache_key = f"password_reset_otp_{email}"
            cache.set(cache_key, otp, 600) 

            cache.set(attempt_key, attempts + 1, 3600)  # 1 hour

            try:
                send_otp(email, otp, "Password Reset - Resend")
                logger.success("OTP resent successfully to: %s", email)

                return Response(
                    {
                        "message": "OTP resent successfully to your email",
                        "email": email,
                    },
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                logger.error("Failed to resend OTP to %s: %s", email, str(e))
                return Response(
                    {"error": "Failed to send OTP. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except User.DoesNotExist:
            return Response(
                {
                    "message": "If this email exists, you will receive an OTP shortly",
                    "email": email,
                },
                status=status.HTTP_200_OK,
            )
