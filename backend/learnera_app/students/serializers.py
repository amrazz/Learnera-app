from rest_framework import serializers
from teachers.models import Assignment, AssignmentSubmission, StudentExam
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
    
    
# 

class StudentExamResultSerializer(serializers.ModelSerializer):
    exam = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    performance = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentExam
        fields = [
            'id',
            'exam',
            'start_time',
            'submit_time',
            'status',
            'total_score',
            'answers',
            'performance'
        ]
    
    def get_exam(self, obj):
        return {
            'id': obj.exam.id,
            'title': obj.exam.title,
            'subject': obj.exam.subject.subject_name,
            'total_mark': obj.exam.total_mark,
            'duration': obj.exam.duration,
            'class_name': obj.exam.class_section.school_class.class_name,
            'section_name': obj.exam.class_section.section_name
        }
    
    def get_answers(self, obj):
        answers = obj.student_answers.select_related('question', 'selected_choice', 'evaluated_by').all()
        return [{
            'id': answer.id,
            'question': {
                'id': answer.question.id,
                'text': answer.question.question_text,
                'type': answer.question.question_type,
                'marks': answer.question.marks,
                'order': answer.question.order
            },
            'answer_text': answer.answer_text,
            'selected_choice': {
                'id': answer.selected_choice.id,
                'text': answer.selected_choice.choice_text,
                'is_correct': answer.selected_choice.is_correct
            } if answer.selected_choice else None,
            'marks_obtained': answer.marks_obtained,
            'evaluation_comment': answer.evaluation_comment,
            'evaluated_by': f"{answer.evaluated_by.user.first_name} {answer.evaluated_by.user.last_name}" if answer.evaluated_by else None
        } for answer in answers]
    
    def get_performance(self, obj):
        total_marks = obj.exam.total_mark
        obtained_marks = obj.total_score or 0
        return {
            'percentage': round((obtained_marks / total_marks * 100) if total_marks > 0 else 0, 2),
            'total_questions': obj.exam.exam_questions.count(),
            'answered_questions': obj.student_answers.count()
        }