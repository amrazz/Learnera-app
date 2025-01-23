from rest_framework import serializers
from teachers.models import Assignment, AssignmentSubmission
from teachers.serializers import SubjectSerializer, SectionSerializer


class StudentAssignmentListSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer()
    class_section = SectionSerializer()
    is_submitted = serializers.SerializerMethodField()
    submission_id = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'title', 'description', 'status', 'subject',
            'class_section', 'created_date', 'last_date', 'is_submitted',
            'submission_id', 'grade'
        ]
        
    def get_is_submitted(self, obj):
        student = self.context['request'].user.student
        return obj.assignment_submissions.filter(
            student = student,
            is_submitted = True
        ).exists()
    
    def get_submission_id(self, obj):
        student = self.context['request'].user.student
        submission = obj.assignment_submissions.filter(
            student = student
        ).first()
        
        return submission.id if submission else None
    
    def get_grade(self, obj):
        student = self.context['request'].user.student
        submission = obj.assignment_submissions.filter(
            student = student
        ).first()
        return submission.grade if submission else None
    

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'work_file', 'is_submitted']
        
    def create(self, validated_data):
        student = self.context['request'].user.student
        validated_data['student'] = student
        validated_data['is_submitted'] = True
        return super().create(validated_data)