from rest_framework import serializers

from teachers.models import (
    Assignment,
    AssignmentSubmission,
    Attendance,
    Exam,
    StudentExam,
)
from .models import (
    Parent,
    PaymentTransaction,
    StudentFeePayment,
    StudentParentRelationship,
)
from students.models import Student, StudentLeaveRequest
from teachers.serializers import CustomUserSerializer, StudentBasicSerializer


class StudentBasicSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Student
        fields = ["id", "user", "admission_number", "roll_number"]


class StudentDetailSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class_teacher = serializers.SerializerMethodField()
    attendance_summary = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "user",
            "admission_number",
            "roll_number",
            "class_assigned",
            "academic_year",
            "class_teacher",
            "attendance_summary",
        ]

    def get_class_teacher(self, obj):
        teacher = obj.class_assigned.class_teacher
        if teacher:
            return {
                "name": f"{teacher.user.first_name} {teacher.user.last_name}",
                "email": teacher.user.email,
                "phone": teacher.user.phone_number,
            }
        return None

    def get_attendance_summary(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Count

        # Get last 30 days attendance
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)

        attendance = (
            obj.attendance_records.filter(date__range=[start_date, end_date])
            .values("status")
            .annotate(count=Count("status"))
        )

        summary = {"present": 0, "absent": 0, "late": 0, "total_days": 0}

        for item in attendance:
            summary[item["status"]] = item["count"]
            summary["total_days"] += item["count"]

        if summary["total_days"] > 0:
            summary["attendance_percentage"] = round(
                (summary["present"] + summary["late"]) / summary["total_days"] * 100, 2
            )
        else:
            summary["attendance_percentage"] = 0

        return summary


class StudentParentRelationshipSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer()

    class Meta:
        model = StudentParentRelationship
        fields = ["id", "student", "relationship_type", "date_added"]


class ParentDetailSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    students = serializers.SerializerMethodField()

    class Meta:
        model = Parent
        fields = ["id", "user", "occupation", "students"]

    def get_students(self, obj):
        relationships = StudentParentRelationship.objects.filter(parent=obj)
        return StudentParentRelationshipSerializer(relationships, many=True).data


class StudentFeePaymentSerializer(serializers.ModelSerializer):
    student_first_name = serializers.CharField(
        source="student.user.first_name", read_only=True
    )
    student_last_name = serializers.CharField(
        source="student.user.last_name", read_only=True
    )
    class_name = serializers.CharField(
        source="student.class_assigned.school_class.class_name", read_only=True
    )
    section_name = serializers.CharField(
        source="student.class_assigned.section_name", read_only=True
    )
    fee_category = serializers.CharField(
        source="fee_structure.fee_category.name", read_only=True
    )

    class Meta:
        model = StudentFeePayment
        fields = [
            "id",
            "fee_structure",
            "fee_category",
            "student",
            "class_name",
            "section_name",
            "student_last_name",
            "student_first_name",
            "total_amount",
            "due_date",
            "status",
        ]
        depth = 1


class PaymentTransactionSerializer(serializers.ModelSerializer):
    fee_category = serializers.CharField(
        source="student_fee_payment.fee_structure.fee_category.name"
    )
    academic_year = serializers.CharField(
        source="student_fee_payment.fee_structure.academic_year.name"
    )
    student_first_name = serializers.CharField(
        source="student_fee_payment.student.user.first_name"
    )
    student_last_name = serializers.CharField(
        source="student_fee_payment.student.user.last_name"
    )
    section = serializers.SerializerMethodField()

    class Meta:
        model = PaymentTransaction
        fields = [
            "id",
            "student_first_name",
            "student_last_name",
            "fee_category",
            "academic_year",
            "section",
            "amount_paid",
            "transaction_date",
            "status",
            "payment_method",
            "stripe_charge_id",
        ]

    def get_section(self, obj):
        section = obj.student_fee_payment.fee_structure.section
        if section:
            return f"{section.class_name} - {section.name}"
        return "Global Fee"


# ----------------------------------


class StudentSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source="class_assigned.school_class.class_name")
    section_name = serializers.CharField(source="class_assigned.section_name")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")

    class Meta:
        model = Student
        fields = [
            "id",
            "admission_number",
            "roll_number",
            "class_name",
            "section_name",
            "last_name",
            "first_name",
        ]


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ["date", "status"]


class AssignmentSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.subject_name")
    submission_status = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id",
            "title",
            "description",
            "subject_name",
            "last_date",
            "submission_status",
        ]

    def get_submission_status(self, obj):
        student = self.context.get("student")
        submission = AssignmentSubmission.objects.filter(
            assignment=obj, student=student
        ).first()
        if not submission:
            return "Not Submitted"
        return "Submitted"


class ExamSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.subject_name")
    exam_status = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            "id",
            "title",
            "subject_name",
            "start_time",
            "end_time",
            "total_mark",
            "exam_status",
        ]

    def get_exam_status(self, obj):
        student = self.context.get("student")
        student_exam = StudentExam.objects.filter(exam=obj, student=student).first()
        return student_exam.status if student_exam else "NOT_STARTED"


class StudentLeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentLeaveRequest
        fields = [
            "id",
            "leave_type",
            "start_date",
            "end_date",
            "reason",
            "status",
            "applied_on",
        ]


class FeePaymentSerializer(serializers.ModelSerializer):
    fee_category = serializers.CharField(source="fee_structure.fee_category.name")

    class Meta:
        model = StudentFeePayment
        fields = ["id", "fee_category", "total_amount", "status", "due_date"]


class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentBasicSerializer()
    marked_by_name = serializers.SerializerMethodField()
    section_name = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = ["id", "student", "status", "date", "marked_by_name", "section_name"]

    def get_marked_by_name(self, obj):
        return f"{obj.marked_by.user.first_name} {obj.marked_by.user.last_name}"

    def get_section_name(self, obj):
        return str(obj.section)
