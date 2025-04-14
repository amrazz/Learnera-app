from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import generate_otp, send_otp
from .models import CustomUser
from .serializers import BaseUserProfileSerializer, ParentProfileSerializer, PasswordChangeSerializer, StudentProfileSerializer, TeacherProfileSerializer, UserLoginserializers
from django.contrib.auth.hashers import check_password

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        print(request.data)
        serializer = UserLoginserializers(data=request.data)
        print("This is the serializers", serializer)
        if serializer.is_valid():
            print("He got valid")
            user = serializer.validated_data["user"]
            role = serializer.validated_data["role"]
            user = CustomUser.objects.get(username = user)
            otp_verified = user.otp_verified
            
            print("This is the otp verified", otp_verified)
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Login successful",
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "role": role,
                    "userEmail" : user.email,
                    "resetPassword" : user.reset_password
                },
                status=status.HTTP_200_OK,
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
            print("Refresh tokem ==", refresh_token)
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"message": "Logout Successful"}, status=status.HTTP_205_RESET_CONTENT
            )

        except KeyError:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": "Token is invalid or expired", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")

        try:
            user = CustomUser.objects.get(email=email)
            if not user.otp_verified:
                otp = generate_otp()
                send_otp(email, otp)
                
                request.session['otp'] = otp
                request.session.set_expiry(600)

                return Response({"message": "OTP send successfully!"})
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        session_otp = request.session.get('otp')
        
        if session_otp is None:
            return Response(
                {"error": "OTP has expired or is invalid"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if session_otp == otp:
            try :
                user = CustomUser.objects.get(email = email)
                
                user.otp_verified = True
                user.save()
                return Response({'message': 'Email verified successfully'})
                
            except CustomUser.DoesNotExist:
                return Response({'error': 'Invalid OTP or expired'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {"error": "Invalid OTP."},
            status=status.HTTP_400_BAD_REQUEST
        )
        
        
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        email = request.data.get("userEmail")
        skip = request.data.get("skip", False)
        
        try:
            user = CustomUser.objects.get(email=email)
            
            if user.reset_password:
                return Response(
                    {"error": "Password has already been changed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
            if skip:
                user.reset_password = True
                user.save()
                return Response(
                    {"message": "Password reset skipped successfully."},
                    status=status.HTTP_200_OK,
                )
                
            if new_password != confirm_password:
                return Response(
                    {"error": "New password and confirmation do not match."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
            user.set_password(new_password)
            user.reset_password = True
            user.save()
            
            return Response(
                {"message": "Password changed successfully!"},
                status=status.HTTP_200_OK,
            )
            
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_400_BAD_REQUEST
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
        if self.request.user.is_teacher:
            return TeacherProfileSerializer
        elif self.request.user.is_student:
            return StudentProfileSerializer
        elif self.request.user.is_parent:
            return ParentProfileSerializer
        return BaseUserProfileSerializer

class UserProfileView(BaseProfileView):
    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer_class = self.get_serializer_class()
        serializer = serializer_class(user)
        
        # Add role information to response
        data = serializer.data
        data['role'] = self.get_user_role(user)
        return Response(data)
    
    def get_user_role(self, user):
        if user.is_teacher:
            return 'teacher'
        elif user.is_student:
            return 'student'
        elif user.is_parent:
            return 'parent'
        return 'user'

    def patch(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().patch(request, *args, **kwargs)
    
    
class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not check_password(serializer.data['current_password'], user.password):
                return Response(
                    {"current_password": "Wrong password."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.data['new_password'])
            user.save()
            return Response({"status": "password changed successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)