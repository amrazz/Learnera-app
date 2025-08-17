from rest_framework import serializers
from .models import Student, StudentLeaveRequest
from teachers.models import Assignment, AssignmentSubmission, Attendance, StudentExam
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
            "id",
            "title",
            "description",
            "status",
            "subject",
            "class_section",
            "created_date",
            "last_date",
            "is_submitted",
            "submission_id",
            "grade",
        ]

    def get_is_submitted(self, obj):
        student = self.context["request"].user.student
        return obj.assignment_submissions.filter(
            student=student, is_submitted=True
        ).exists()

    def get_submission_id(self, obj):
        student = self.context["request"].user.student
        submission = obj.assignment_submissions.filter(student=student).first()

        return submission.id if submission else None

    def get_grade(self, obj):
        student = self.context["request"].user.student
        submission = obj.assignment_submissions.filter(student=student).first()
        return submission.grade if submission else None


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ["id", "assignment", "work_file", "is_submitted"]

    def create(self, validated_data):
        student = self.context["request"].user.student
        validated_data["student"] = student
        validated_data["is_submitted"] = True
        return super().create(validated_data)


#


class StudentExamResultSerializer(serializers.ModelSerializer):
    exam = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    performance = serializers.SerializerMethodField()

    class Meta:
        model = StudentExam
        fields = [
            "id",
            "exam",
            "start_time",
            "submit_time",
            "status",
            "total_score",
            "answers",
            "performance",
        ]

    def get_exam(self, obj):
        return {
            "id": obj.exam.id,
            "title": obj.exam.title,
            "subject": obj.exam.subject.subject_name,
            "total_mark": obj.exam.total_mark,
            "duration": obj.exam.duration,
            "class_name": obj.exam.class_section.school_class.class_name,
            "section_name": obj.exam.class_section.section_name,
        }

    def get_answers(self, obj):
        answers = obj.student_answers.select_related(
            "question", "selected_choice", "evaluated_by"
        ).all()
        return [
            {
                "id": answer.id,
                "question": {
                    "id": answer.question.id,
                    "text": answer.question.question_text,
                    "type": answer.question.question_type,
                    "marks": answer.question.marks,
                    "order": answer.question.order,
                },
                "answer_text": answer.answer_text,
                "selected_choice": (
                    {
                        "id": answer.selected_choice.id,
                        "text": answer.selected_choice.choice_text,
                        "is_correct": answer.selected_choice.is_correct,
                    }
                    if answer.selected_choice
                    else None
                ),
                "marks_obtained": answer.marks_obtained,
                "evaluation_comment": answer.evaluation_comment,
                "evaluated_by": (
                    f"{answer.evaluated_by.user.first_name} {answer.evaluated_by.user.last_name}"
                    if answer.evaluated_by
                    else None
                ),
            }
            for answer in answers
        ]

    def get_performance(self, obj):
        total_marks = obj.exam.total_mark
        obtained_marks = obj.total_score or 0
        return {
            "percentage": round(
                (obtained_marks / total_marks * 100) if total_marks > 0 else 0, 2
            ),
            "total_questions": obj.exam.exam_questions.count(),
            "answered_questions": obj.student_answers.count(),
        }


# ---------------------------------------------------------


class MyAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    section_name = serializers.CharField(source="section.section_name", read_only=True)
    class_name = serializers.CharField(
        source="section.school_class.class_name", read_only=True
    )

    class Meta:
        model = Attendance
        fields = ["id", "student_name", "class_name", "section_name", "status", "date"]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"


class AttendanceStatisticsSerializer(serializers.Serializer):
    total_days = serializers.IntegerField()
    present_days = serializers.IntegerField()
    absent_days = serializers.IntegerField()
    late_days = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()


class StudentLeaveRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    class_teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentLeaveRequest
        fields = [
            "id",
            "student_name",
            "class_teacher_name",
            "leave_type",
            "start_date",
            "end_date",
            "status",
            "applied_on",
            "reason",
            "supporting_document",
            "response_comment",
        ]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_class_teacher_name(self, obj):
        return f"{obj.class_teacher.user.first_name} {obj.class_teacher.user.last_name}"


class StudentLeaveRequestDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    class_teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = StudentLeaveRequest
        fields = [
            "id",
            "student_name",
            "class_teacher_name",
            "leave_type",
            "start_date",
            "end_date",
            "reason",
            "supporting_document",
            "status",
            "applied_on",
            "response_comment",
        ]
        read_only_fields = ["student", "class_teacher", "status", "applied_on"]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"

    def get_class_teacher_name(self, obj):
        return f"{obj.class_teacher.user.first_name} {obj.class_teacher.user.last_name}"

    def create(self, validated_data):
        student = Student.objects.get(user=self.context["request"].user)
        class_teacher = student.class_assigned.class_teacher

        leave_request = StudentLeaveRequest.objects.create(
            student=student, class_teacher=class_teacher, **validated_data
        )
        return leave_request
