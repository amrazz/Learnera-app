import json
from django.db import transaction
from parents.models import (
    FeeCategory,
    FeeStructure,
    Parent,
    StudentFeePayment,
    StudentParentRelationship,
)
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import date
from users.models import CustomUser
from students.models import Student
from datetime import datetime
from rest_framework import serializers
from django.contrib.auth import authenticate
from teachers.models import (
    AcademicYear,
    Attendance,
    SchoolClass,
    Section,
    Subject,
    Teacher,
    TeacherDocument,
    TeacherLeaveRequest,
)
from django.contrib.auth import get_user_model

User = get_user_model()


class SchoolAdminLoginSerializers(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    password = serializers.CharField(max_length=100, write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username:
            raise serializers.ValidationError("Username is required")
        elif not password:
            raise serializers.ValidationError("Password is required")

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.is_schooladmin:
            raise serializers.ValidationError("You do not have access as School admin")

        return {"user": user, "username": username, "password": password}


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    emergency_contact_number = serializers.CharField(
        required=False, allow_null=True, allow_blank=True
    )
    profile_image = serializers.ImageField(required=False)
    is_student = serializers.BooleanField(required=False)
    is_parent = serializers.BooleanField(required=False)
    is_teacher = serializers.BooleanField(required=False)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "password",
            "profile_image",
            "first_name",
            "last_name",
            "phone_number",
            "emergency_contact_number",
            "date_of_birth",
            "gender",
            "address",
            "city",
            "state",
            "district",
            "country",
            "is_student",
            "is_parent",
            "is_teacher",
            "is_active",
        ]

    def validate_username(self, value):
        if not str(value).strip():
            raise serializers.ValidationError("Username is required.")

        if value.startswith("__") or value.startswith("  "):
            raise serializers.ValidationError(
                "Username cannot start with spaces or underscores."
            )

        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("User with same username already exists.")

        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate_password(self, value):
        import re

        if not str(value).strip():
            raise serializers.ValidationError("Password is required.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError(
                "Password must contain at least 1 uppercase letter."
            )
        if not re.search(r"\d", value):
            raise serializers.ValidationError(
                "Password must contain at least 1 number."
            )
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError(
                "Password must contain at least 1 special character."
            )
        return value

    def validate_phone_number(self, value):
        phone_validator = RegexValidator(
            r"^\+?\d{10,15}$", "Enter a valid phone number."
        )
        phone_validator(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()

        return user


class SchoolAdminStudentSerializers(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class_assigned = serializers.PrimaryKeyRelatedField(queryset=Section.objects.all())

    class Meta:
        model = Student
        fields = [
            "user",
            "admission_number",
            "class_assigned",
        ]


    def validate_class_assigned(self, value):
        if not value:
            raise serializers.ValidationError("Class is not provided.")
        return value

    def create(self, validated_data):
        user_data = validated_data.pop("user", {})

        user_serializer = CustomUserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        student = Student.objects.create(user=user, **validated_data)
        now = datetime.now().year

        return student

    def to_internal_value(self, data):
        if isinstance(data.get("user"), str):
            try:
                data["user"] = json.loads(data["user"])
            except json.JSONDecodeError:
                raise serializers.ValidationError({"user": "Invalid JSON data"})
        return super().to_internal_value(data)


class SectionSerializer(serializers.ModelSerializer):
    class_teacher_info = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = [
            "id",
            "section_name",
            "student_count",
            "available_students",
            "class_teacher_info",
        ]

    def get_class_teacher_info(self, obj):
        class_teacher = obj.class_teacher
        if class_teacher:
            return {
                "id": class_teacher.id,
                "name": f"{class_teacher.user.first_name} ",
            }
        return None


class SchoolClassSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    class_teacher = serializers.CharField(required=False)

    class Meta:
        model = SchoolClass
        fields = ["id", "class_name", "class_teacher", "sections"]


class StudentListSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class_assigned = serializers.SerializerMethodField()
    parents = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "user",
            "admission_number",
            "class_assigned",
            "parents",
        ]

    def get_class_assigned(self, obj):
        return {
            "id": obj.class_assigned.id,
            "class_name": obj.class_assigned.school_class.class_name,
            "section_name": obj.class_assigned.section_name,
        }

    def get_parents(self, obj):

        relationships = StudentParentRelationship.objects.filter(
            student=obj
        ).select_related("parent__user")
        return [
            {
                "parent_name": f"{rel.parent.user.first_name} {rel.parent.user.last_name}",
                "relationship_type": rel.relationship_type,
            }
            for rel in relationships
        ]


class StudentDetailSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    class_assigned = serializers.SerializerMethodField()
    parents = serializers.SerializerMethodField()
    roll_number = serializers.IntegerField(required=False)

    class Meta:
        model = Student
        fields = [
            "id",
            "user",
            "admission_number",
            "class_assigned",
            "parents",
            "roll_number",
        ]

    def get_class_assigned(self, obj):
        return {
            "id": obj.class_assigned.id,
            "class_name": obj.class_assigned.school_class.class_name,
            "section_name": obj.class_assigned.section_name,
        }

    def get_parents(self, obj):
        relationship = (
            StudentParentRelationship.objects.filter(student=obj)
            .select_related("parent__user")
            .first()
        )

        if relationship:
            return {
                "parent_name": f"{relationship.parent.user.first_name} {relationship.parent.user.last_name}",
                "relationship_type": relationship.relationship_type,
                "parent_phone_number": relationship.parent.user.phone_number,
            }
        return {}


class AdminParentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    students = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Parent
        fields = ["id", "user", "occupation", "students"]

    def create(self, validated_data):
        user_data = validated_data.pop("user", {})
        user_serializer = CustomUserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()


# -----------------------------------------------------------------------------


class SchoolClassCreateSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(write_only=True)
    student_count = serializers.IntegerField(
        required=False, write_only=True, default=30
    )
    class_teacher = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(), write_only=True, required=False
    )
    class_teacher_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SchoolClass
        fields = [
            "id",
            "class_name",
            "class_teacher",
            "section_name",
            "student_count",
            "class_teacher_info",
        ]

    def get_class_teacher_info(self, obj):
        section = Section.objects.filter(school_class=obj.id).first()
        if section:
            return {
                "id": section.class_teacher.id,
                "name": section.class_teacher.user.full_name,
                "email": section.class_teacher.user.email,
            }
        return None

    def validate_section_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Section name cannot be empty.")
        return value.upper()

    def create(self, validated_data):
        section_name = validated_data.pop("section_name", None)
        student_count = validated_data.pop("student_count", 30)
        class_teacher = validated_data.pop("class_teacher", None)

        if not section_name:
            raise serializers.ValidationError(
                {"section_name": "Section name is required to create a section."}
            )

        # Create or retrieve the SchoolClass
        school_class, created = SchoolClass.objects.get_or_create(
            class_name=validated_data.get("class_name"), defaults=validated_data
        )

        # Check if the section already exists for this class
        if Section.objects.filter(
            school_class=school_class, section_name=section_name
        ).exists():
            raise serializers.ValidationError(
                {
                    "section_name": f"Section {section_name} already exists for class {school_class.class_name}."
                }
            )

        Section.objects.create(
            school_class=school_class,
            section_name=section_name,
            student_count=student_count,
            class_teacher=class_teacher,
        )

        return school_class


class ClassListSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = SchoolClass
        fields = ["id", "class_name", "sections"]


class SchoolClassUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ["id", "class_name"]

    def update(self, instance, validated_data):
        # Extract section data from the request data (not validated_data)
        section_data = self.context.get("request").data.get("section", None)

        # Update SchoolClass fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if section_data and self.context.get("section_instance"):
            section = self.context["section_instance"]

            class_teacher = section_data.get("class_teacher")
            if class_teacher is not None:
                section.class_teacher_id = class_teacher

            # Update other section fields
            section.section_name = section_data.get(
                "section_name", section.section_name
            )
            section.student_count = section_data.get(
                "student_count", section.student_count
            )

            section.save()

        return instance


class SectionTeacherAssignmentSerializer(serializers.Serializer):
    teacher_id = serializers.IntegerField()
    section_id = serializers.IntegerField()

    def validate(self, data):
        try:
            self.teacher = Teacher.objects.get(id=data["teacher_id"])
            self.section = Section.objects.get(id=data["section_id"])
        except (Teacher.DoesNotExist, Section.DoesNotExist):
            raise serializers.ValidationError("Invalid teacher_id or section_id")
        return data

    def create(self, validated_data):
        # Assign the teacher to the section
        self.section.class_teacher = self.teacher
        self.section.save()

        # Add the section to the teacher's sections
        self.teacher.sections.add(self.section)

        # Add the class to the teacher's classes
        self.teacher.classes.add(self.section.school_class)

        return {"teacher": self.teacher, "section": self.section}


# PARENT MANAGEMENT
# ---------------------------------------------------------------------------


class StudentParentRelationshipSerlaizer(serializers.ModelSerializer):
    class Meta:
        model = StudentParentRelationship
        fields = ["student", "parent", "relationship_type", "date_added"]


# ---------------------------------------------------------------------------
class StudentUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "profile_image",
            "full_name",
        ]

    def get_profile_image(self, obj):
        request = self.context.get("request")
        if obj.profile_image and hasattr(obj.profile_image, "url"):
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class ParentStudentSerializer(serializers.ModelSerializer):
    user = StudentUserSerializer(read_only=True)
    class_name = serializers.CharField(
        source="class_assigned.class_name", read_only=True
    )
    admission_number = serializers.CharField(read_only=True)
    relationship_type = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ["id", "admission_number", "user", "class_name", "relationship_type"]

    def get_relationship_type(self, obj):
        parent = self.context.get("parent")
        if parent:
            relationship = StudentParentRelationship.objects.filter(
                parent=parent, student=obj
            ).first()
            return relationship.relationship_type if relationship else None


class ParentUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "password",
            "profile_image",
            "first_name",
            "last_name",
            "phone_number",
            "emergency_contact_number",
            "date_of_birth",
            "gender",
            "address",
            "city",
            "state",
            "district",
            "country",
            "is_active",
        ]

    def get_profile_image(self, obj):
        request = self.context.get("request")
        if obj.profile_image and hasattr(obj.profile_image, "url"):
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None

    def update(self, instance, validated_data):
        validated_data.pop("password", None)
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")

        if instance.profile_image and hasattr(instance.profile_image, "url"):
            if request:
                representation["profile_image"] = request.build_absolute_uri(
                    instance.profile_image.url
                )
            else:
                representation["profile_image"] = instance.profile_image.url
        return representation


class ParentListSerlaizer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Parent
        fields = ["id", "user", "occupation"]


class ParentSerializer(serializers.ModelSerializer):
    user = ParentUserSerializer()
    student_relationship = serializers.SerializerMethodField()

    class Meta:
        model = Parent
        fields = ["id", "user", "occupation", "student_relationship"]

    def get_student_relationship(self, obj):
        student_relationships = self.context.get("student_relationship", [])
        return [
            {
                "student_id": rel.student.user.id,
                "student_name": f"{rel.student.user.first_name} {rel.student.user.last_name}",
                "admission_number": rel.student.admission_number,
                "relationship_type": rel.relationship_type,
            }
            for rel in student_relationships
        ]

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user_data["is_parent"] = True

        user_seralizer = CustomUserSerializer(data=user_data)
        user_seralizer.is_valid(raise_exception=True)
        user = user_seralizer.save()

        parent = Parent.objects.create(user=user, **validated_data)
        return parent

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)

        if user_data:
            user_serializer = ParentUserSerializer(
                instance.user, data=user_data, partial=True
            )
            if user_serializer.is_valid(raise_exception=True):
                user_serializer.save()

        if "occupation" in validated_data:
            instance.occupation = validated_data["occupation"]
            instance.save()

        return super().update(instance, validated_data)


# -------------------------------------------------------------------------------------------------

# Teacher Serlaizers
# -------------------------------------------------------------------------------------------------


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "subject_name"]

    def create(self, validated_data):
        subject_name = validated_data.pop("subject_name")
        subject = Subject.objects.create(subject_name=subject_name)
        return subject


class TeacherDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherDocument
        fields = ["id", "title", "document", "uploaded_at"]


class TeacherSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()
    documents = TeacherDocumentSerializer(many=True, source="docs", read_only=True)
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False
    )
    subject_name = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            "id",
            "user",
            "documents",
            "subject",
            "subject_name",
        ]

    def get_subject_name(self, obj):
        if obj.subject:
            return obj.subject.subject_name
        return "No subject Assigned"

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user_data["is_teacher"] = True

        user_serializer = CustomUserSerializer(data=user_data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()

        subject = validated_data.pop("subject", None)
        teacher = Teacher.objects.create(user=user, subject=subject)

        # Handle document uploads if present in request
        request = self.context.get("request")
        if request and request.FILES:
            documents = request.FILES.getlist("documents")
            document_titles = request.POST.getlist("document_titles")

            for doc, title in zip(documents, document_titles):
                TeacherDocument.objects.create(
                    teacher=teacher, document=doc, title=title
                )

        return teacher

    def update(self, instance, validated_data):
        try:
            user_data = validated_data.pop("user", None)
            if user_data:
                user_serializer = CustomUserSerializer(
                    instance.user, data=user_data, partial=True
                )
                user_serializer.is_valid(raise_exception=True)
                user_serializer.save()

            subject = validated_data.pop("subject", None)
            if subject:
                instance.subject = subject

            # Handle document uploads if present in request
            request = self.context.get("request")
            if request and "documents" in request.FILES:
                documents = request.FILES.getlist("documents")
                document_titles = request.POST.getlist("document_titles")

                for doc, title in zip(documents, document_titles):
                    TeacherDocument.objects.create(
                        teacher=instance, document=doc, title=title
                    )

            instance.save()
            return instance

        except Exception as e:
            raise serializers.ValidationError(
                {"error": "Failed to update teacher", "details": str(e)}
            )


# ---------------------------------------


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


# ----------------------------------------------------------------------------------


# Payment details


class FeeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeCategory
        fields = "__all__"


class FeeStructureSerializer(serializers.ModelSerializer):
    fee_category_name = serializers.CharField(
        source="fee_category.name", read_only=True
    )
    class_name = serializers.CharField(
        source="section.school_class.class_name", read_only=True, allow_null=True
    )
    section_name = serializers.CharField(
        source="section.section_name", read_only=True, allow_null=True
    )
    academic_year_name = serializers.CharField(
        source="academic_year.name", read_only=True
    )

    class Meta:
        model = FeeStructure
        fields = [
            "id",
            "fee_type",
            "amount",
            "academic_year",
            "academic_year_name",
            "class_name",
            "section",
            "section_name",
            "fee_category",
            "fee_category_name",
            "due_date",
        ]
        extra_kwargs = {
            "academic_year": {"read_only": True},
            "section": {"required": False, "allow_null": True},
        }

    def validate(self, data):
        fee_type = data.get("fee_type")
        section = data.get("section")

        if fee_type == "GLOBAL" and section:
            raise serializers.ValidationError(
                {"section": "Section should not be provided for global fees"}
            )
        if fee_type == "SPECIFIC" and not section:
            raise serializers.ValidationError(
                {"section": "Section is required for specific fees"}
            )

        return data

    def create(self, validated_data):
        academic_year = AcademicYear.objects.filter(is_active=True).first()
        if not academic_year:
            raise serializers.ValidationError("No active academic year found")

        validated_data["academic_year"] = academic_year
        fee_structure = super().create(validated_data)

        if fee_structure.fee_type == "GLOBAL":
            students = Student.objects.filter(academic_year=academic_year)
        elif fee_structure.section:
            students = Student.objects.filter(
                academic_year=academic_year, class_assigned=fee_structure.section
            )
        else:
            students = Student.objects.none()

        student_fee_payments = [
            StudentFeePayment(
                student=student,
                fee_structure=fee_structure,
                total_amount=fee_structure.amount,
                due_date=fee_structure.due_date,
                status="PENDING",
            )
            for student in students
        ]
        StudentFeePayment.objects.bulk_create(student_fee_payments)

        return fee_structure


class StudentFeePaymentSerializer(serializers.ModelSerializer):
    student_first_name = serializers.CharField(
        source="student.user.first_name", read_only=True
    )
    student_last_name = serializers.CharField(
        source="student.user.last_name", read_only=True
    )
    fee_structure_details = serializers.SerializerMethodField(read_only=True)
    student_class = serializers.CharField(
        source="student.class_assigned.school_class.class_name", read_only=True
    )
    student_section = serializers.CharField(
        source="student.class_assigned.section_name", read_only=True
    )

    class Meta:
        model = StudentFeePayment
        fields = [
            "id",
            "student",
            "student_first_name",
            "student_last_name",
            "fee_structure",
            "fee_structure_details",
            "total_amount",
            "status",
            "due_date",
            "stripe_invoice_id",
            "stripe_payment_intent_id",
            "created_at",
            "updated_at",
            "student_class",
            "student_section",
        ]

    def get_fee_structure_details(self, obj):
        return {
            "fee_category_name": obj.fee_structure.fee_category.name,
            "amount": obj.fee_structure.amount,
            "due_date": obj.fee_structure.due_date,
            "section_name": (
                obj.fee_structure.section.section_name
                if obj.fee_structure.section
                else None
            ),
            "academic_year_name": obj.fee_structure.academic_year.name,
        }


# ------------------------------------------------------------


class AdminTeacherLeaveRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    document_url = serializers.SerializerMethodField()

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
            "document_url",
        ]

    def get_teacher_name(self, obj):
        return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}"

    def get_document_url(self, obj):
        if obj.supporting_document:
            return obj.supporting_document.url
        return None


class AdminLeaveResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherLeaveRequest
        fields = ["status", "response_comment"]

    def validate_status(self, value):
        if value not in ["APPROVED", "REJECTED"]:
            raise serializers.ValidationError(
                "Status must be either APPROVED or REJECTED"
            )
        return value


# _-----------------------------------
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


from rest_framework import serializers
from .models import CustomUser  # Adjust import as needed


class SchoolAdminProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = [
            "username",
            "email",
            "school_name",
            "school_type",
            "phone_number",
            "address",
            "city",
            "state",
            "district",
            "country",
            "profile_image",
            "school_logo",
        ]

    def validate_email(self, value):
        user = self.context["request"].user
        if CustomUser.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        user = self.context["request"].user
        if CustomUser.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value
