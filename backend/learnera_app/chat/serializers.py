from rest_framework import serializers
from teachers.models import Teacher
from students.models import Student
from users.models import CustomUser
from .models import UserChatMessage


class CustomUserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    last_message = serializers.CharField(read_only=True)
    last_message_timestamp = serializers.DateTimeField(read_only=True)
    class Meta:
        model = CustomUser
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'is_teacher', 
            'is_student', 
            'is_parent',
            'profile_image',
            'display_name',
            'last_message',
            'last_message_timestamp'
        ]
    def get_display_name(self, obj):
        viewer = self.context.get('viewer')
        
        if not viewer:
            return f"{obj.first_name} {obj.last_name}"
        
        if viewer.is_teacher and obj.is_student:
            try:
                student = Student.objects.get(user=obj)
                return f"{obj.first_name} {obj.last_name} {student.class_assigned}"
            except Student.DoesNotExist:
                return f"{obj.first_name} {obj.last_name}"
            
        elif (viewer.is_student or viewer.is_parent) and obj.is_teacher:
            try:
                teacher = Teacher.objects.get(user = obj)
                subject_name = getattr(teacher.subject, "subject_name", "")
                separator = f" - {subject_name}" if subject_name else ""
                return f"{teacher.user.first_name} {teacher.user.last_name}{separator}"

            except Teacher.DoesNotExist:
                return f"{obj.first_name} {obj.last_name}"
            
        return f"{obj.first_name} {obj.last_name}"
    

class UserChatMessageSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    receiver = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = UserChatMessage
        fields = ['id', 'sender', 'receiver', 'message', 'timestamp']
        read_only_fields = ['timestamp']

    def validate(self, data):
        sender = data.get('sender')
        receiver = data.get('receiver')

        # Validation logic
        if sender.is_teacher:
            if not (receiver.is_student or receiver.is_parent):
                raise serializers.ValidationError("If sender is teacher, receiver must be student or parent")
        
        if sender.is_parent:
            if not receiver.is_teacher:
                raise serializers.ValidationError("If sender is parent, receiver must be teacher")
        
        if sender.is_student:
            if not receiver.is_teacher:
                raise serializers.ValidationError("If sender is student, receiver must be teacher")

        return data