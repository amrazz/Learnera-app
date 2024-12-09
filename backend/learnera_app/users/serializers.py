from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "gender",
            "is_teacher",
            "is_student",
            "is_parent",
            "is_active",
        )
        extra_kwargs = {"password": {"write_only": True}}


class UserRegisterSerializers(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "gender",
            "is_teacher",
            "is_student",
            "is_parent",
            "is_active",
        )
        extra_kwargs = {"password": {"write_only": True}}

    def validate_username_and_email(self, value):
        if CustomUser.objects.filter(username=value.username).exists():
            raise serializers.ValidationError("This username already exists!!")
        elif CustomUser.objects.filter(email=value.email).exists():
            raise serializers.ValidationError("This email already exists!!")

        else:
            return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            gender=validated_data.get("gender", ""),
            is_teacher=validated_data.get("is_teacher", False),
            is_student=validated_data.get("is_student", False),
            is_parent=validated_data.get("is_parent", False),
            is_active=validated_data.get("is_active", True),
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

class UserLoginserializers(serializers.ModelSerializer):
    username = serializers.CharField(max_length = 100)
    password = serializers.CharField(max_length = 100, write_only = True)
    
        
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username:
            raise serializers.ValidationError("Username is required")
        if not password:
            raise serializers.ValidationError("password is required")
        
        user = authenticate(username=username, password = password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        return {
            'user' : user,
            "username" : username,
            "password" : password
        }
        
