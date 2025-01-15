from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .utils import generate_otp, send_otp
from .models import CustomUser
from .serializers import UserLoginserializers


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