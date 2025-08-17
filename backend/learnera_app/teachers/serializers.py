from django.utils import timezone
from rest_framework import serializers
from parents.models import Parent, StudentParentRelationship
from users.models import CustomUser
from .models import (
    Assignment,
    AssignmentSubmission,
    Attendance,
    Exam,
    MCQChoice,
    Question,
    Section,
    StudentAnswer,
    StudentExam,
    Teacher,
    SchoolClass,
    Subject,
    TeacherLeaveRequest,
)
from students.models import Student, StudentLeaveRequest


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
            "is_active",
        ]


class StudentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Student
        fields = ["id", "user", "admission_number"]


class StudentInfoSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    parent = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "user", "parent", "admission_number"]

    def get_parent(self, obj):
        try:
            parent = Parent.objects.get(students=obj)
            relationship = StudentParentRelationship.objects.filter(
                parent=parent
            ).first()
            return {
                "id": parent.id,
                "parent_name": f"{parent.user.first_name} {parent.user.last_name}",
                "occupation": parent.occupation,
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
        fields = ["id", "roll_number", "student_name", "last_attendance_date"]

    def get_student_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_roll_number(self, obj):
        return obj.roll_number if obj.roll_number else None

    def get_last_attendance_date(self, obj):
        try:
            latest_attendance = Attendance.objects.filter(student=obj).latest("date")
            return latest_attendance.date
        except Attendance.DoesNotExist:
            return None


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        models = Attendance
        fields = ["id", "student", "date", "status"]


class AttendanceMarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ["student", "status"]


class BulkAttendanceSerializer(serializers.Serializer):
    date = serializers.DateField()
    attendance_data = AttendanceMarkSerializer(many=True)


class AttendanceSchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ["id", "class_name"]


class AttendanceSectionSerializer(serializers.ModelSerializer):
    school_class = AttendanceSchoolClassSerializer()

    class Meta:
        model = Section
        fields = ["id", "section_name", "school_class"]


class AttendanceHistorySerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    roll_number = serializers.CharField(source="student.roll_number")
    section = AttendanceSectionSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "student_name", "roll_number", "status", "date", "section"]

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"


class MonthlyStatisticsSerializer(serializers.Serializer):
    month = serializers.DateField()
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    late_count = serializers.IntegerField()
    total_students = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()


# ----------------------------------------------------------


class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ["id", "class_name"]


class SectionSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source="school_class.class_name")

    class Meta:
        model = Section
        fields = ["id", "section_name", "class_name", "school_class"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "subject_name"]


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            "id",
            "title",
            "description",
            "status",
            "subject",
            "class_section",
            "last_date",
        ]

    def validate_last_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Last date must be in the future.")
        return value

    def create(self, validated_data):
        teacher = self.context["request"].user.teacher
        validated_data["teacher"] = teacher
        validated_data["is_active"] = True

        return super().create(validated_data)


class AssignmentListSerializer(serializers.ModelSerializer):
    class_section = SectionSerializer()
    subject = SubjectSerializer()
    submission_count = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id",
            "title",
            "description",
            "status",
            "subject",
            "class_section",
            "teacher",
            "created_date",
            "last_date",
            "is_active",
            "submission_count",
            "student_count",
        ]

    def get_submission_count(self, obj):
        return obj.assignment_submissions.count()

    def get_student_count(self, obj):
        return obj.class_section.available_students


class StudentBasicSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")

    class Meta:
        model = Student
        fields = ["id", "first_name", "last_name", "admission_number", "roll_number"]


class AssignmentSubmissionListSerializer(serializers.ModelSerializer):
    student = StudentBasicSerializer()
    submission_date = serializers.DateTimeField(source="submitted_at")

    class Meta:
        model = AssignmentSubmission
        fields = ["id", "student", "submission_date", "work_file", "grade", "feedback"]


class AssignmentGradeSubmissionSerlaizer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ["grade", "feedback"]

    def validate_grade(self, value):
        if value < 0 or value > 100:
            return serializers.ValidationError("Grade must be between 0 & 100")
        return value


# ------------------------------------------------


class MCQChoiceSerializer(serializers.ModelSerializer):  # This is taken
    class Meta:
        model = MCQChoice
        fields = ["id", "choice_text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):  # This is taken
    choices = MCQChoiceSerializer(many=True, source="choice_questions", required=False)

    class Meta:
        model = Question
        fields = ["id", "question_text", "question_type", "marks", "order", "choices"]

    def validate(self, data):
        if data["question_type"] == "MCQ" and not self.initial_data.get("choices"):
            raise serializers.ValidationError("MCQ questions must have choices.")
        return data

    def create(self, validated_data):
        choices_data = validated_data.pop("choice_questions", [])
        question = Question.objects.create(**validated_data)
        if question.question_type == "MCQ":
            for choice in choices_data:
                MCQChoice.objects.create(question=question, **choice)
        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop("choice_questions", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if choices_data is not None:
            instance.choice_questions.all().delete()
            for choice in choices_data:
                MCQChoice.objects.create(question=instance, **choice)

        return instance


class QuestionDetailSerializer(serializers.ModelSerializer):  # This is taken
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "question_text", "question_type", "marks", "order", "choices"]

    def get_choices(self, obj):
        if obj.question_type == "MCQ":
            return MCQChoiceSerializer(obj.choice_questions.all(), many=True).data
        return []


class ExamSerializer(serializers.ModelSerializer):  # This is taken
    question = QuestionSerializer(many=True, source="exam_questions", required=False)
    total_questions = serializers.SerializerMethodField()
    class_name = serializers.CharField(
        read_only=True, source="class_section.school_class.class_name"
    )
    section_name = serializers.CharField(
        read_only=True, source="class_section.section_name"
    )
    subject_name = serializers.CharField(read_only=True, source="subject.subject_name")

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "subject",
            "subject_name",
            "question",
            "description",
            "teacher",
            "class_section",
            "total_mark",
            "duration",
            "start_time",
            "end_time",
            "meet_link",
            "status",
            "class_name",
            "section_name",
            "total_questions",
        ]
        read_only_fields = ["status", "teacher"]
        extra_kwargs = {
            "subject": {"required": False},
            "duration": {"required": False},
            "start_time": {"required": False},
            "end_time": {"required": False},
            "meet_link": {"required": False},
        }

    def get_total_questions(self, obj):
        return obj.exam_questions.count()

    def validate(self, data):
        if self.instance:
            if "start_time" in data and "end_time" in data:
                if data["start_time"] >= data["end_time"]:
                    raise serializers.ValidationError(
                        "End time must be after start time"
                    )
        else:
            required_fields = [
                "subject",
                "duration",
                "start_time",
                "end_time",
                "meet_link",
            ]
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError(
                        {field: "This field is required."}
                    )
            if data["start_time"] >= data["end_time"]:
                raise serializers.ValidationError("End time must be after start time")

        return data


class StudentAnswerSerializer(serializers.ModelSerializer):  # This is taken
    class Meta:
        model = StudentAnswer
        fields = [
            "id",
            "question",
            "answer_text",
            "selected_choice",
            "marks_obtained",
            "evaluated_by",
            "evaluation_comment",
        ]
        read_only_fields = ["marks_obtained", "evaluation_comment"]

    def validate(self, data):
        question = data["question"]
        if question.question_type == "MCQ":
            if not data.get("selected_choice"):
                raise serializers.ValidationError(
                    "MCQ questions must have a selected choice"
                )
            if data["selected_choice"].question != question:
                raise serializers.ValidationError(
                    "Selected choice does not belong to this question"
                )
        else:
            if not data.get("answer_text"):
                raise serializers.ValidationError(
                    "Essay questions must have an answer text"
                )
        return data


class StudentAnswerDetailSerializer(serializers.ModelSerializer):  # This is taken
    question = QuestionDetailSerializer(read_only=True)
    selected_choice = MCQChoiceSerializer(read_only=True)

    class Meta:
        model = StudentAnswer
        fields = [
            "id",
            "question",
            "answer_text",
            "selected_choice",
            "marks_obtained",
            "evaluated_by",
            "evaluation_comment",
        ]
        read_only_fields = ["marks_obtained", "evaluation_comment"]

    def validate(self, data):
        question = data["question"]
        if question.question_type == "MCQ":
            if not data.get("selected_choice"):
                raise serializers.ValidationError(
                    "MCQ questions must have a selected choice"
                )
            if data["selected_choice"].question != question:
                raise serializers.ValidationError(
                    "Selected choice does not belong to this question"
                )
        else:
            if not data.get("answer_text"):
                raise serializers.ValidationError(
                    "Essay questions must have an answer text"
                )
        return data


class StudentExamSerializer(serializers.ModelSerializer):  # This is taken
    answers = StudentAnswerSerializer(
        many=True, source="student_answers", read_only=True
    )
    progress = serializers.SerializerMethodField()

    class Meta:
        model = StudentExam
        fields = [
            "id",
            "student",
            "exam",
            "start_time",
            "submit_time",
            "status",
            "total_score",
            "answers",
            "progress",
        ]
        read_only_fields = ["total_score"]

    def get_progress(self, obj):
        total_questions = obj.exam.exam_questions.count()
        answered_questions = obj.student_answers.count()
        return f"{answered_questions}/{total_questions}"


class StudentExamDetailSerializer(serializers.ModelSerializer):  # This is taken
    student = serializers.SerializerMethodField()
    student_answers = StudentAnswerDetailSerializer(many=True, read_only=True)
    exam_details = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = StudentExam
        fields = [
            "id",
            "student",
            "exam_details",
            "start_time",
            "submit_time",
            "status",
            "total_score",
            "student_answers",
            "progress",
        ]
        read_only_fields = ["total_score"]

    def get_student(self, obj):
        return {
            "id": obj.student.id,
            "name": f"{obj.student.user.first_name} {obj.student.user.last_name}",
            "username": obj.student.user.username,
        }

    def get_exam_details(self, obj):
        return {
            "id": obj.exam.id,
            "title": obj.exam.title,
            "subject": obj.exam.subject.subject_name if obj.exam.subject else None,
            "total_mark": obj.exam.total_mark,
        }

    def get_progress(self, obj):
        total_questions = obj.exam.exam_questions.count()
        answered_questions = obj.student_answers.count()
        return f"{answered_questions}/{total_questions}"


class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAnswer
        fields = ["id", "marks_obtained", "evaluation_comment"]
        extra_kwargs = {"evaluation_comment": {"required": False}}

    def validate_marks_obtained(self, value):
        if float(value) < 0:
            raise serializers.ValidationError("Marks cannot be negative")
        if float(value) > self.instance.question.marks:
            raise serializers.ValidationError(
                f"Marks cannot exceed maximum marks: {self.instance.question.marks}"
            )
        return value


class ExamResultSerializer(serializers.ModelSerializer):
    student = StudentBasicSerializer()
    exam = serializers.SerializerMethodField()
    answers = StudentAnswerDetailSerializer(source="student_answers", many=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = StudentExam
        fields = [
            "id",
            "student",
            "exam",
            "start_time",
            "submit_time",
            "status",
            "total_score",
            "answers",
            "progress",
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
            "start_time": obj.exam.start_time,
            "end_time": obj.exam.end_time,
        }

    def get_progress(self, obj):
        total_questions = obj.exam.exam_questions.count()
        answered_questions = obj.student_answers.count()
        return {
            "answered": answered_questions,
            "total": total_questions,
            "percentage": round(
                (
                    (answered_questions / total_questions * 100)
                    if total_questions > 0
                    else 0
                ),
                2,
            ),
        }


#  ----------------------------


class TeacherLeaveResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentLeaveRequest
        fields = ["status", "response_comment"]

    def validate_status(self, value):
        if value not in ["APPROVED", "REJECTED"]:
            raise serializers.ValidationError(
                "Status must be either APPROVED or REJECTED"
            )
        return value


class TeacherLeaveRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    responded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherLeaveRequest
        fields = [
            "id",
            "teacher_name",
            "leave_type",
            "start_date",
            "end_date",
            "status",
            "applied_on",
        ]

    def get_teacher_name(self, obj):
        return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"


class TeacherLeaveRequestDetailSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = TeacherLeaveRequest
        fields = [
            "id",
            "teacher_name",
            "leave_type",
            "start_date",
            "end_date",
            "reason",
            "supporting_document",
            "status",
            "response_comment",
            "applied_on",
        ]

    def get_teacher_name(self, obj):
        return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"


class TeacherLeaveRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    supporting_document = serializers.SerializerMethodField()

    class Meta:
        model = TeacherLeaveRequest
        fields = [
            "id",
            "teacher_name",
            "leave_type",
            "start_date",
            "end_date",
            "status",
            "applied_on",
            "reason",
            "supporting_document",
            "response_comment",
        ]
        read_only_fields = ["status", "response_comment", "teacher_name"]

    def get_supporting_document(self, obj):
        if obj.supporting_document:
            return self.context["request"].build_absolute_uri(
                obj.supporting_document.url
            )
        return None

    def get_teacher_name(self, obj):
        return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"

    def create(self, validated_data):
        teacher = Teacher.objects.get(user=self.context["request"].user)
        leave_request = TeacherLeaveRequest.objects.create(
            teacher=teacher, **validated_data
        )
        return leave_request
