from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
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
            
            
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Login successful",
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "role" : role
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
        try :
            refresh_token = request.data["refreshToken"]
            print("Refresh tokem ==", refresh_token)
            token = RefreshToken(refresh_token)
            token.blacklist()


            
            return Response({"message": "Logout Successful"}, status=status.HTTP_205_RESET_CONTENT)
            
        except KeyError:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Token is invalid or expired", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
