from rest_framework import serializers
from .models import Parent, PaymentTransaction, StudentFeePayment, StudentParentRelationship
from students.models import Student
from teachers.serializers import CustomUserSerializer, StudentBasicSerializer


class StudentBasicSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Student
        fields = ["id", "user", "admission_number", "roll_number"]


class StudentParentRelationshipSerializer(serializers.ModelSerializer):
    student = StudentBasicSerializer()

    class Meta:
        model = StudentParentRelationship
        fields = ["id", "student", "relationship_type", "date_added"]


class ParentDetailSerlaizer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()
    user = CustomUserSerializer()

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
    fee_category = serializers.CharField(source = "fee_structure.fee_category.name", read_only = True)

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
    fee_category = serializers.CharField(source='student_fee_payment.fee_structure.fee_category.name')
    academic_year = serializers.CharField(source='student_fee_payment.fee_structure.academic_year.name')
    student_first_name = serializers.CharField(source='student_fee_payment.student.user.first_name')
    student_last_name = serializers.CharField(source='student_fee_payment.student.user.last_name')
    section = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentTransaction
        fields = [
            'id',
            'student_first_name',
            'student_last_name',
            'fee_category',
            'academic_year',
            'section',
            'amount_paid',
            'transaction_date',
            'status',
            'payment_method',
            'stripe_charge_id'
        ]
    
    def get_section(self, obj):
        section = obj.student_fee_payment.fee_structure.section
        if section:
            return f"{section.class_name} - {section.name}"
        return "Global Fee"