from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate



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
        print(f"This is the serializer username and password {username, password}")
        user = authenticate(username=username, password = password)
        print("This is the authenticated user", user)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not hasattr(user, role) or not getattr(user, role):
            raise serializers.ValidationError(f"You are not a {role.upper().replace('is', "")}.")
        

        return {
            'user' : user,
            'role' : role
        }
        
        
class BaseUserProfileSerializer(serializers.ModelSerializer):
    """Base serializer for common user fields"""
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'profile_image', 'phone_number',
            'gender', 'date_of_birth', 'address', 'city', 'state',
            'district', 'postal_code', 'country'
        ]
        
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