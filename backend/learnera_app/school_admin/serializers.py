from rest_framework import serializers
from .models import SchoolAdmin


class SchoolAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolAdmin
        fields = ['user', 'school_name', 'address', 'school_type', 'school_logo']
        
    
        
