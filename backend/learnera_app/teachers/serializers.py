import datetime
from rest_framework import serializers
from parents.models import Parent, StudentParentRelationship
from users.models import CustomUser
from .models import Attendance, Section, Teacher, SchoolClass, Subject
from students.models import Student


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "gender",
            "date_of_birth",
            "profile_image",
            "is_active"
        ]

class StudentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    
    class Meta:
        model = Student
        fields = ['id', 'user', 'admission_number']
        

class StudentInfoSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    parent = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ["id", 'user', 'parent', "admission_number"]
        
    def get_parent(self, obj):
        try:
            parent = Parent.objects.get(students = obj)
            relationship = StudentParentRelationship.objects.filter(parent = parent).first()
            print("this is the relationship" , relationship.relationship_type)
            return {
                "id": parent.id,
                "parent_name": f"{parent.user.first_name} {parent.user.last_name}",
                "occupation" : parent.occupation,
                "phone_number": parent.user.phone_number,
                "relationship_type": relationship.relationship_type,
            }
        except Parent.DoesNotExist:
            return None
        
# -------------------------------------------------------------

class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    roll_number = serializers.SerializerMethodField()
    last_attendance_date = serializers.SerializerMethodField() 
    
    class Meta:
        model = Student
        fields = ['id', 'roll_number', 'student_name', 'last_attendance_date']
        
    def get_student_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_roll_number(self, obj):
        return obj.roll_number
    
    def get_last_attendance_date(self, obj):
        try:
            latest_attendance = Attendance.objects.filter(student = obj).latest('date')
            return latest_attendance.date
        except Attendance.DoesNotExist:
            return None
    
    
    
    
class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        models = Attendance
        fields = ['id', 'student', 'date', 'status']
        
class AttendanceMarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['student', 'status']

class BulkAttendanceSerializer(serializers.Serializer):
    date = serializers.DateField()
    attendance_data = AttendanceMarkSerializer(many=True)


class AttendanceSchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ['id', 'class_name']

class AttendanceSectionSerializer(serializers.ModelSerializer):
    school_class = AttendanceSchoolClassSerializer()
    
    class Meta:
        model = Section
        fields = ['id', 'section_name', 'school_class']   

class AttendanceHistorySerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField() 
    roll_number = serializers.CharField(source = 'student.roll_number')
    section = AttendanceSectionSerializer(read_only = True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'student_name', 'roll_number', 'status', 'date', 'section']
    
    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"
    
class MonthlyStatisticsSerializer(serializers.Serializer):
    month = serializers.DateField()
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    late_count = serializers.IntegerField()
    total_students = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()