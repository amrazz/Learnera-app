from rest_framework import serializers
from .models import Parent, StudentParentRelationship
from students.models import Student
from teachers.serializers import CustomUserSerializer, StudentBasicSerializer



class StudentBasicSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer() 

    class Meta:
        model = Student
        fields = ['id', 'user', 'admission_number', 'roll_number']



class StudentParentRelationshipSerializer(serializers.ModelSerializer):
    student = StudentBasicSerializer() 

    class Meta:
        model = StudentParentRelationship
        fields = ['id', 'student', 'relationship_type', 'date_added']
        

class ParentDetailSerlaizer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()
    user = CustomUserSerializer()   
    class Meta:
        model = Parent
        fields = ['id', 'user', 'occupation', 'students']

    def get_students(self, obj):
        relationships = StudentParentRelationship.objects.filter(parent = obj)
        return StudentParentRelationshipSerializer(relationships, many=True).data