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
    # Use SerializerMethodField to control the output of profile_image
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'profile_image', 'phone_number',
            'gender', 'date_of_birth', 'address', 'city', 'state',
            'district', 'postal_code', 'country'
        ]

    def get_profile_image(self, obj):
        request = self.context.get("request")
        if obj.profile_image:
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            else:
                return f"http://localhost:5173{obj.profile_image.url}"
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