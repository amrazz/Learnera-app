from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate, get_user_model
from loguru import logger
import re
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
User = get_user_model()


class UserLoginserializers(serializers.Serializer):
        
    username = serializers.CharField(max_length = 100)
    password = serializers.CharField(max_length = 100, write_only = True)
    role = serializers.CharField(max_length = 100)
    
        
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        role = data.get("role")
        
        
        if not username or not password or not role:
            raise serializers.ValidationError("All fields (username, password, and role) are required.")
        user = authenticate(username=username, password = password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not hasattr(user, role) or not getattr(user, role):
            raise serializers.ValidationError(f"You are not a {role.upper().replace('is', "")}.")
        

        return {
            'user' : user,
            'role' : role
        }
        
        
class BaseUserProfileSerializer(serializers.ModelSerializer):
    # Use SerializerMethodField to control the output of profile_image
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'username','first_name', 'last_name', 'email', 'profile_image', 'phone_number',
            'gender', 'date_of_birth', 'address', 'city', 'state',
            'district', 'postal_code', 'country'
        ]

    def get_profile_image(self, obj):
        request = self.context.get("request")
        if obj.profile_image:
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            else:
                return f"http://localhost:8000{obj.profile_image.url}"
                # return f"https://api.learnerapp.site{obj.profile_image.url}"
        return None

    def validate_email(self, value):
        user = self.context['request'].user
        if CustomUser.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if CustomUser.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

class TeacherProfileSerializer(BaseUserProfileSerializer):
    class Meta(BaseUserProfileSerializer.Meta):
        fields = BaseUserProfileSerializer.Meta.fields + ['emergency_contact_number']

class StudentProfileSerializer(BaseUserProfileSerializer):
    class Meta(BaseUserProfileSerializer.Meta):
        fields = BaseUserProfileSerializer.Meta.fields

class ParentProfileSerializer(BaseUserProfileSerializer):
    class Meta(BaseUserProfileSerializer.Meta):
        fields = BaseUserProfileSerializer.Meta.fields + ['emergency_contact_number']
        
        
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    
class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not value:
            return serializers.ValidationError("Email is required.")
        
        value = value.strip().lower()
        
        if len(value) > 200:
            return serializers.ValidationError("Email is too long.")
        
        if not User.objects.filter(email = value).exists():
            return serializers.ValidationError("Email does not exists.")
        
        return value
        
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length = 4)
    
    def validate_email(self, value):
        if not value:
            return serializers.ValidationError("Email is required.")
        
        value = value.strip().lower()
        
        if len(value) > 200:
            return serializers.ValidationError("Email is too long.")
        
        if not User.objects.filter(email = value).exists():
            return serializers.ValidationError("Email does not exists.")
        
        return value
        
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        
        if len(value) != 4:
            raise serializers.ValidationError("OTP must be 4 digit long.")
        
        return value
    
class ResetPasswordConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length = 4)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    
    def validate_email(self, value):
        if not value:
            return serializers.ValidationError("Email is required.")
        
        value = value.strip().lower()
        
        if len(value) > 200:
            return serializers.ValidationError("Email is too long.")
        
        if not User.objects.filter(email = value).exists():
            return serializers.ValidationError("Email does not exists.")
        
        return value
        
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        
        if len(value) != 4:
            raise serializers.ValidationError("OTP must be 4 digit long.")
        
        return value
    
    
    def validate_new_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character")
        
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        
        return value
    
    def validate(self, attrs):
        new_password =  attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")
        
        if new_password != confirm_password:
            raise serializers.ValidationError("Password does not match")
        
        return attrs