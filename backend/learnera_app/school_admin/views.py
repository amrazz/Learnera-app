import json
import logging
import calendar
from .serializers import *
from decimal import Decimal
from parents.models import *
from datetime import datetime
from teachers.models import *
from datetime import timedelta
from .email import EmailService
from django.http import Http404
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from students.models import Student
from .models import AdmissionNumber
from rest_framework import serializers
from .services import RollNumberService
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models.functions import TruncMonth
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_encode
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.tokens import default_token_generator
from parents.serializers import ExamSerializer, StudentSerializer
from rest_framework import permissions, status, viewsets, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Sum, Count, Case, When, F, DecimalField, Count, Q, Sum

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


handler = logging.FileHandler("admin_views_log.log")
handler.setLevel(logging.DEBUG)


formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)

if not logger.hasHandlers():
    logger.addHandler(handler)


User = get_user_model()


# STUDENT MANAGEMENT

# --------------------------------------------------------------


def set_password_link(user):
    uid = urlsafe_base64_encode(force_bytes(user.id))
    token = default_token_generator.make_token(user)
    set_password_link = f"https://learnerapp.site/set-password/{uid}/{token}/"
    return set_password_link


class SchoolAdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.debug("Login request received with data: %s", request.data)
        serializer = SchoolAdminLoginSerializers(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            logger.info("Successful login for school admin: %s", user.username)
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Admin Login successful",
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "role": "school_admin" if user.is_schooladmin else None,
                },
                status=status.HTTP_200_OK,
            )
        logger.warning("Login failed with errors: %s", serializer.errors)
        return Response(
            {"error": "Login Failed", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateStudentView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        logger.debug("Create student request received: %s", request.data)

        try:
            class_assigned_id = request.data.get("class_assigned")
            section = Section.objects.get(id=class_assigned_id)

            if section.available_students >= section.student_count:
                logger.warning("Section %s is full", class_assigned_id)
                return Response(
                    {"error": "This section has reached its maximum student limit."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            admission_number_obj, _ = AdmissionNumber.objects.get_or_create(
                key="admission_number", defaults={"value": "200000"}
            )
            admission_number = int(admission_number_obj.value) + 1
            admission_number_obj.value = str(admission_number)
            admission_number_obj.save()

            user_data = json.loads(request.data.get("user", "{}"))
            profile_image = request.FILES.get("profile_image")
            if profile_image:
                user_data["profile_image"] = profile_image

            student_data = {
                "user": user_data,
                "admission_number": str(admission_number),
                "class_assigned": request.data.get("class_assigned"),
            }

            parent_relationships = json.loads(
                request.data.get("parent_relationships", "[]")
            )
            serializer = SchoolAdminStudentSerializers(data=student_data)

            if not serializer.is_valid():
                logger.warning("Student serializer invalid: %s", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            student = serializer.save()
            logger.info("Student created with username: %s", user_data.get("username"))
            new_user = User.objects.get(username=user_data.get("username"))
            if new_user:
                password_link = set_password_link(new_user)

            # Academic year logic
            current_date = datetime.now().date()
            try:
                active_academic_year = AcademicYear.objects.get(is_active=True)
            except AcademicYear.DoesNotExist:
                active_academic_year = None

            if not active_academic_year or not (
                active_academic_year.start_date <= current_date
            ):
                logger.info("Creating new academic year for date: %s", current_date)
                if active_academic_year:
                    active_academic_year.is_active = False
                    active_academic_year.save()
                new_start_date = datetime(current_date.year, 6, 1).date()
                new_end_date = datetime(current_date.year + 1, 3, 30).date()
                active_academic_year = AcademicYear.objects.create(
                    name=f"{new_start_date.year}-{new_end_date.year}",
                    start_date=new_start_date,
                    end_date=new_end_date,
                    is_active=True,
                )

            student.academic_year = active_academic_year
            student.save()

            section.available_students += 1
            section.save()

            try:
                RollNumberService.assign_roll_number(
                    student, student.class_assigned, student.academic_year
                )
                RollNumberService.reorder_by_name(
                    student.class_assigned, student.academic_year
                )
                logger.info("Roll number assigned for student %s", student.id)
            except Exception as e:
                logger.error("Roll number assignment failed: %s", str(e))
                transaction.set_rollback(True)
                return Response(
                    {"error": f"Failed to assign roll number: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for relationship in parent_relationships:
                try:
                    parent = Parent.objects.get(id=relationship["parent_id"])
                    StudentParentRelationship.objects.create(
                        parent=parent,
                        student=student,
                        relationship_type=relationship["relationship_type"],
                    )
                except Parent.DoesNotExist:
                    logger.warning("Invalid parent ID: %s", relationship["parent_id"])
                    raise ValidationError("Invalid parent ID provided")

            try:
                EmailService.send_welcome_email(
                    user_type="Student",
                    email=user_data["email"],
                    username=user_data["username"],
                    set_password_link=password_link,
                )
                logger.info("Welcome email sent to %s", user_data["email"])
            except Exception as email_error:
                logger.error("Error sending welcome email: %s", str(email_error))

            return Response(
                {"message": "Student created successfully"},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.exception("Unhandled error during student creation: %s", str(e))
            transaction.set_rollback(True)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ClassListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        class_id = request.query_params.get("class_id")
        try:
            if class_id:
                school_class = (
                    SchoolClass.objects.prefetch_related("sections")
                    .filter(id=class_id)
                    .first()
                )
                if not school_class:
                    logger.warning("Class with ID %s not found", class_id)
                    return Response(
                        {"error": "Class not found"}, status=status.HTTP_404_NOT_FOUND
                    )

                section_serializer = SectionSerializer(school_class.sections, many=True)
                return Response(section_serializer.data, status=status.HTTP_200_OK)

            school_classes = SchoolClass.objects.prefetch_related("sections").all()
            serializer = SchoolClassSerializer(school_classes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error retrieving class list: %s", str(e))
            return Response(
                {"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST
            )


class ShowStudentsView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Student.objects.select_related(
        "user", "class_assigned", "class_assigned__school_class"
    ).all()
    serializer_class = StudentListSerializer


class StudentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk, *args, **kwargs):
        try:
            student = Student.objects.select_related(
                "user", "class_assigned", "class_assigned__school_class"
            ).get(user__id=pk)
            serializer = StudentDetailSerializer(student)
            logger.info("Fetched details for student id: %s", pk)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            logger.warning("Student with id %s not found", pk)
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception("Error fetching student details: %s", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StudentUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk, *args, **kwargs):
        try:
            student = Student.objects.select_related("user").get(user__id=pk)
            logger.debug("Updating student %s with data: %s", pk, request.data)

            if "profile_image" in request.FILES:
                student.user.profile_image = request.FILES["profile_image"]
                student.user.save()

            # Update fields
            for key, value in request.data.items():
                if key in [
                    "admission_number",
                    "roll_number",
                    "parent_name",
                    "parent_email",
                    "class_assigned",
                ]:
                    if key == "class_assigned":
                        student.class_assigned = Section.objects.get(id=value)
                    else:
                        setattr(student, key, value)
                elif key in [
                    "first_name",
                    "last_name",
                    "email",
                    "phone_number",
                    "address",
                    "city",
                    "state",
                    "country",
                    "date_of_birth",
                    "gender",
                    "emergency_contact_number",
                ]:
                    setattr(student.user, key, value)

            student.user.save()
            student.save()

            serializer = StudentDetailSerializer(student)
            logger.info("Successfully updated student: %s", pk)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Student.DoesNotExist:
            logger.warning("Student with id %s not found for update", pk)
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Section.DoesNotExist:
            logger.warning("Invalid class assignment provided for student: %s", pk)
            return Response(
                {"error": "Invalid class assignment"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.exception("Unexpected error updating student: %s", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StudentDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk, *args, **kwargs):
        try:
            student = Student.objects.get(user__id=pk)
            student.user.delete()
            student.delete()
            return Response(
                {"message": "Student deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------------------------


class StudentParentRelationshipView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
            parent_id = request.data.get("parent_id")
            relationship_type = request.data.get("relationship_type")

            if not all([parent_id, relationship_type]):
                return Response(
                    {"error": "Parent ID and relationship type are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Remove existing relationship if any
            StudentParentRelationship.objects.filter(student=student).delete()

            # Create new relationship
            relationship = StudentParentRelationship.objects.create(
                student=student,
                parent_id=parent_id,
                relationship_type=relationship_type,
            )

            return Response(
                {"message": "Parent relationship updated successfully"},
                status=status.HTTP_200_OK,
            )

        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id)
            StudentParentRelationship.objects.filter(student=student).delete()
            return Response(
                {"message": "Parent relationship removed successfully"},
                status=status.HTTP_200_OK,
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )


# -----------------------------------------------


class StudentBlockView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk, *args, **kwargs):
        try:
            student = Student.objects.get(user__id=pk)
            student.user.is_active = False
            student.user.save()
            student.save()

            return Response(
                {"message": "Student blocked successfully"}, status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        try:
            student = Student.objects.get(user__id=pk)
            student.user.is_active = True
            student.user.save()
            student.save()

            return Response(
                {"message": "Student Unblocked successfully"}, status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# CLASS MANAGEMENT
# -----------------------------------------------------------------------------


class CreateSchoolClassViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = SchoolClassCreateSerializer
    queryset = SchoolClass.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        school_class = serializer.save()
        response_serializer = SchoolClassSerializer(school_class)

        return Response(
            {
                "message": "Class Created Successfully!!",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class SchoolClassListView(generics.ListAPIView):
    queryset = SchoolClass.objects.all().prefetch_related(
        "sections", "sections__class_teacher", "sections__class_teacher__user"
    )
    serializer_class = ClassListSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class SchoolClassSectionUpdateView(generics.UpdateAPIView):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassUpdateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        try:
            context["section_instance"] = Section.objects.get(
                pk=self.kwargs.get("section_pk"), school_class_id=self.kwargs.get("pk")
            )
        except Section.DoesNotExist:
            raise ValidationError("Section does not exist")
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        section_instance = self.get_serializer_context().get("section_instance")

        # Prepare data for serialization
        data = {
            "class_name": request.data.get("class_name", instance.class_name),
        }

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Fetch the updated instance with its sections
        updated_instance = SchoolClass.objects.get(id=instance.id)
        response_data = ClassListSerializer(updated_instance).data

        return Response(
            {
                "message": "Class and section updated successfully",
                "data": response_data,
            },
            status=status.HTTP_200_OK,
        )


class DeleteClassSectionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, class_id, section_id, *args, **kwargs):
        print(f"this is the class id{class_id} this is the section ID {section_id}")
        try:
            section = Section.objects.get(school_class_id=class_id, id=section_id)
            section.delete()
            return Response(
                {"message": "Section deleted Successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Section.DoesNotExist:
            return Response(
                {"error": "Section not found"}, status=status.HTTP_404_NOT_FOUND
            )


class AssignClassTeacherViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = SectionTeacherAssignmentSerializer
    queryset = Section.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()

        return Response(
            {
                "message": "Teacher assigned to section successfully",
                "data": {
                    "teacher": assignment["teacher"].user.username,
                    "section": str(assignment["section"]),
                },
            },
            status=status.HTTP_201_CREATED,
        )


# PARENT MANAGEMENT

# --------------------------------------------------------------------


class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = PageNumberPagination

    def get_pagination_class(self):
        paginate = self.request.query_params.get("paginate", "true").lower()
        if paginate == "false":
            self.pagination_class = None
            return None
        return self.pagination_class

    def list(self, request, *args, **kwargs):
        self.pagination_class = self.get_pagination_class()
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        try:
            user_data = json.loads(request.data.get("user", "{}"))

            if "profile_image" in request.FILES:
                user_data["profile_image"] = request.FILES["profile_image"]

            data = {
                "user": user_data,
                "occupation": request.data.get("occupation", ""),
            }

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            parent = serializer.save()
            new_user = parent.user
            password_link = set_password_link(new_user)

            try:

                EmailService.send_welcome_email(
                    user_type="Parent",
                    email=user_data["email"],
                    username=user_data["username"],
                    set_password_link=password_link,
                )
                print("Welcome email initiated for:", user_data["email"])
            except Exception as email_error:
                print(f"Failed to send welcome email: {str(email_error)}")

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        except Exception as e:
            error_detail = getattr(e, "detail", None)
            if error_detail is not None:
                return Response(error_detail, status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ParentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        parent = get_object_or_404(Parent, pk=pk)
        return parent

    def get(self, request, pk):
        parent = self.get_object(pk)
        student_relationship = StudentParentRelationship.objects.select_related(
            "student"
        ).filter(parent=parent)
        print("This is the student parent relation", student_relationship)
        serializer = ParentSerializer(
            parent, context={"student_relationship": student_relationship}
        )
        return Response(serializer.data)

    def put(self, request, pk):
        parent = self.get_object(pk)

        try:
            data = json.loads(request.data.get("data", "{}"))

            if "profile_image" in request.FILES:
                if "user" not in data:
                    data["user"] = {}
                data["user"]["profile_image"] = request.FILES["profile_image"]

            serializer = ParentSerializer(
                parent,
                data=data,
                partial=True,
                context={"request": request},
            )
            if serializer.is_valid():

                parent = serializer.save()
                print(f"this is the validated parent", parent)
                return Response(
                    ParentSerializer(parent, context={"request": request}).data,
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except json.JSONDecodeError:
            return Response(
                {"error": "Invalid JSON data"}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        parent = self.get_object(pk)
        if parent:
            parent.user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class ParentStudentManagementView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        parent = get_object_or_404(Parent, pk=pk)
        action = request.data.get("action")
        relationships = request.data.get("relationships", [])

        if action not in ["add", "remove"]:
            return Response(
                {"error": "Invalid action. Use 'add' or 'remove'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if action == "add":
                for rel in relationships:
                    student = Student.objects.get(
                        admission_number=rel["admission_number"]
                    )

                    StudentParentRelationship.objects.create(
                        student=student,
                        parent=parent,
                        relationship_type=rel.get("relationship_type", "Guardian"),
                    )
            else:
                admission_numbers = [rel["admission_number"] for rel in relationships]
                students = Student.objects.filter(
                    admission_number__in=admission_numbers
                )

                StudentParentRelationship.objects.filter(
                    student__in=students, parent=parent
                ).delete()

            return Response(
                ParentSerializer(parent, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )

        except Student.DoesNotExist:
            return Response(
                {"error": "One or more students not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ParentBlockUnblockView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(Parent, pk=pk)

    def post(self, request, pk, *args, **kwargs):
        try:
            parent = self.get_object(pk)
            print("This is the parent", parent)

            if not parent.user.is_active:
                return Response(
                    {"message": "Parent is already blocked"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            parent.user.is_active = False
            parent.user.save()

            return Response(
                {
                    "message": "Parent has been blocked successfully",
                    "status": "blocked",
                    "user_id": parent.user.id,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": f"Error blocking parent: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def put(self, request, pk):
        try:
            parent = self.get_object(pk)

            # Check if parent is already active
            if parent.user.is_active:
                return Response(
                    {"message": "Parent is already active or Unblock"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            parent.user.is_active = True
            parent.user.save()

            return Response(
                {
                    "message": "Parent has been unblocked successfully",
                    "status": "active",
                    "user_id": parent.user.id,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"message": f"Error unblocking parent: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GetStudentParentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = StudentParentRelationship.objects.select_related(
        "student__user", "parent__user"
    )
    serializer_class = StudentParentRelationshipSerlaizer


# -----------------------------------------------------------------------------

# Teacher management


class SubjectListView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = SubjectSerializer
    pagination_class = None


class TeacherListCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, *args, **kwargs):
        teachers = Teacher.objects.all()
        serializer = TeacherSerializer(teachers, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user_data = json.loads(request.data.get("user", {}))
        subject_id = request.data.get("subject_id", None)
        new_subject_name = request.data.get("new_subject_name", None)

        if "profile_image" in request.FILES:
            user_data["profile_image"] = request.FILES["profile_image"]

        subject = None
        if subject_id:
            subject = Subject.objects.get(pk=subject_id)
        elif new_subject_name:
            subject, created = Subject.objects.get_or_create(
                subject_name=new_subject_name
            )
        serializer = TeacherSerializer(
            data={"user": user_data, "subject": subject.id if subject else None},
            context={"request": request},
        )
        if serializer.is_valid():
            teacher = serializer.save()
            newuser = teacher.user
            password_link = set_password_link(newuser)
            try:
                EmailService.send_welcome_email(
                    user_type="Teacher",
                    email=user_data["email"],
                    username=user_data["username"],
                    set_password_link=password_link,
                )
                print("Welcome email initiated for:", user_data["email"])
            except Exception as email_error:
                print(f"Failed to send welcome email: {str(email_error)}")

            return Response(
                TeacherSerializer(teacher).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self, pk):
        try:
            return Teacher.objects.get(pk=pk)
        except Teacher.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        teacher = self.get_object(pk)
        serializer = TeacherSerializer(teacher)
        return Response(serializer.data)

    def patch(self, request, pk):
        teacher = self.get_object(pk)

        try:
            data = json.loads(request.data.get("data", "{}"))
            print("This is the teacher data to patch", data)
            # Handle profile image upload
            if "profile_image" in request.FILES:
                data["user"] = data.get("user", {})
                data["user"]["profile_image"] = request.FILES["profile_image"]

            # Handle document uploads
            if "documents" in request.FILES:
                documents = request.FILES.getlist("documents")
                document_titles = request.POST.getlist("document_titles")
                data["documents"] = documents
                data["document_titles"] = document_titles

            # Update the teacher instance
            serializer = TeacherSerializer(
                teacher, data=data, partial=True, context={"request": request}
            )

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        teacher = self.get_object(pk=pk)
        try:
            teacher.user.delete()
            teacher.delete()

            return Response(
                {"message": "Teacher and associated data deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeacherDocumentDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            document = TeacherDocument.objects.get(pk=pk)
            document.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TeacherDocument.DoesNotExist:
            raise Http404


class TeacherBlockUnblockView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(Teacher, pk=pk)

    def post(self, request, pk):
        teacher = self.get_object(pk)
        try:
            if not teacher.user.is_active:
                return Response(
                    {"message": "Teacher is already blocked"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            teacher.user.is_active = False
            teacher.user.save()

            return Response(
                {
                    "message": "Teacher has been blocked successfully",
                    "status": "blocked",
                    "user_id": teacher.user.id,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": f"Error blocking parent: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def put(self, request, pk):
        teacher = self.get_object(pk)
        try:
            if teacher.user.is_active:
                return Response(
                    {
                        "message": "Teacher is already unblocked or inactive",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            teacher.user.is_active = True
            teacher.user.save()
            return Response(
                {
                    "message": "Teacher has been Unblocked successfully",
                    "status": "blocked",
                    "user_id": teacher.user.id,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"message": f"Error blocking parent: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# --------------------------------------------------------------


class AdminAttendanceView(generics.ListAPIView):
    serializer_class = AttendanceHistorySerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        class_id = self.request.query_params.get("class_id")
        section_id = self.request.query_params.get("section_id")
        month = self.request.query_params.get("month")
        year = self.request.query_params.get("year")
        status = self.request.query_params.get("status")
        weekday = self.request.query_params.get("weekday")

        queryset = (
            Attendance.objects.all()
            .select_related(
                "student__user",
                "section__school_class",
            )
            .order_by("-date", "student__roll_number")
        )

        if class_id:
            queryset = queryset.filter(section__school_class_id=class_id)

        if section_id:
            queryset = queryset.filter(section_id=section_id)

        if year and year != "all":
            queryset = queryset.filter(date__year=int(year))

        if month and month != "all":
            queryset = queryset.filter(date__month=int(month))

        if status and status != "all":
            queryset = queryset.filter(status=status)

        if weekday and weekday != "all":
            weekday_map = {"1": 2, "2": 3, "3": 4, "4": 5, "5": 6, "6": 7, "7": 1}
            queryset = queryset.filter(date__week_day=weekday_map[weekday])

        return queryset


class AdminMonthlyStatisticsView(generics.ListAPIView):
    serializer_class = MonthlyStatisticsSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        class_id = self.request.query_params.get("class_id")
        section_id = self.request.query_params.get("section_id")
        year = self.request.query_params.get("year")
        month = self.request.query_params.get("month")
        weekday = self.request.query_params.get("weekday")

        query = Attendance.objects.all()

        if class_id:
            query = query.filter(section__school_class_id=class_id)
            total_students = Student.objects.filter(
                class_assigned__school_class_id=class_id
            ).count()

        if section_id:
            query = query.filter(section_id=section_id)
            total_students = Student.objects.filter(
                class_assigned_id=section_id
            ).count()
        else:
            total_students = Student.objects.all().count()

        if year and year != "all":
            query = query.filter(date__year=int(year))

        if month and month != "all":
            query = query.filter(date__month=int(month))

        if weekday and weekday != "all":
            weekday_map = {"1": 2, "2": 3, "3": 4, "4": 5, "5": 6, "6": 7, "7": 1}
            query = query.filter(date__week_day=weekday_map[weekday])

        monthly_stats = (
            query.annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(
                present_count=Count("id", filter=Q(status="present")),
                absent_count=Count("id", filter=Q(status="absent")),
                late_count=Count("id", filter=Q(status="late")),
            )
            .order_by("month")
        )

        for stat in monthly_stats:
            stat["total_students"] = total_students
            month = stat["month"].month
            year = stat["month"].year
            working_days = self.get_working_days(year, month, weekday)

            if working_days > 0:
                expected_attendance = working_days * total_students
                actual_attendance = stat["present_count"] + stat["late_count"]
                stat["attendance_percentage"] = (
                    actual_attendance / expected_attendance
                ) * 100
            else:
                stat["attendance_percentage"] = 0

        return monthly_stats

    def get_working_days(self, year, month, weekday=None):
        total_days = calendar.monthrange(year, month)[1]
        working_days = 0

        for day in range(1, total_days + 1):
            date = datetime(year, month, day)
            if weekday:
                if str(date.isoweekday()) == weekday:
                    working_days += 1
            elif date.weekday() < 5:  # Monday to Friday
                working_days += 1

        return working_days


class AdminClassListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None
    serializer_class = AttendanceSchoolClassSerializer

    def get_queryset(self):
        cache_key = "school_classes"
        queryset = cache.get(cache_key)
        if queryset is None:
            queryset = SchoolClass.objects.all()
            cache.set(cache_key, queryset, timeout=3600)
        return queryset


class AdminSectionListView(generics.ListAPIView):
    serializer_class = AttendanceSectionSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        class_id = self.kwargs.get("class_id")
        return Section.objects.filter(school_class_id=class_id)


# ----------------------------------------------------------------------

# Payment integration


class FeeCategoryListCreateView(generics.ListCreateAPIView):
    queryset = FeeCategory.objects.all()
    serializer_class = FeeCategorySerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class FeeCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = FeeCategory.objects.all()
    serializer_class = FeeCategorySerializer
    pagination_class = None


class FeeStructureListCreateView(generics.ListCreateAPIView):
    serializer_class = FeeStructureSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        queryset = FeeStructure.objects.all()
        fee_type = self.request.query_params.get("fee_type")
        academic_year = AcademicYear.objects.filter(is_active=True).first()

        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)

        if fee_type:
            queryset = queryset.filter(fee_type=fee_type)

        return queryset.select_related(
            "fee_category", "section__school_class", "academic_year"
        )

    def perform_create(self, serializer):
        academic_year = AcademicYear.objects.filter(is_active=True).first()
        if not academic_year:
            raise serializers.ValidationError("No active academic year found.")
        serializer.save(academic_year=academic_year)


class FeeStructureDetailedView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class StudentFeePaymentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = StudentFeePaymentSerializer

    def get_queryset(self):
        queryset = StudentFeePayment.objects.all()

        status = self.request.query_params.get("status", None)
        section = self.request.query_params.get("section", None)
        fee_category = self.request.query_params.get("fee_category", None)
        search = self.request.query_params.get("search", None)

        if status:
            queryset = queryset.filter(status=status)
        if section:
            queryset = queryset.filter(student__class_assigned__id=section)
        if fee_category:
            queryset = queryset.filter(fee_structure__fee_category__id=fee_category)
        if search:
            queryset = queryset.filter(student__user__full_name__icontains=search)

        return queryset

    def get_summary(self):
        queryset = self.get_queryset()

        summary = queryset.aggregate(
            total_amount=Sum(F("fee_structure__amount"), default=Decimal("0.00")),
            paid_amount=Sum(
                Case(
                    When(status="PAID", then=F("fee_structure__amount")),
                    default=0,
                    output_field=DecimalField(),
                ),
                default=Decimal("0.00"),
            ),
            pending_amount=Sum(
                Case(
                    When(
                        status__in=["PENDING", "OVERDUE"],
                        then=F("fee_structure__amount"),
                    ),
                    default=0,
                    output_field=DecimalField(),
                ),
                default=Decimal("0.00"),
            ),
            total_students=Count("student", distinct=True),
            paid_students=Count(
                Case(
                    When(status="PAID", then=1),
                ),
                distinct=True,
            ),
            pending_students=Count(
                Case(
                    When(status__in=["PENDING", "OVERDUE"], then=1),
                ),
                distinct=True,
            ),
        )

        return summary

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        summary = self.get_summary()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data["summary"] = summary
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data, "summary": summary})


# -------------------------------------------------------------


# Admin Dashboard
class DashboardStatsAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Get current date and last month
        today = timezone.now()
        last_month = today - timedelta(days=30)

        # Basic statistics
        stats = {
            "total_students": Student.objects.count(),
            "total_teachers": Teacher.objects.count(),
            "total_parents": Parent.objects.count(),
            "pending_fees": StudentFeePayment.objects.filter(status="PENDING").count(),
            # Attendance overview for last month
            "attendance": {
                "present": Attendance.objects.filter(
                    date__gte=last_month, status="present"
                ).count(),
                "absent": Attendance.objects.filter(
                    date__gte=last_month, status="absent"
                ).count(),
                "late": Attendance.objects.filter(
                    date__gte=last_month, status="late"
                ).count(),
            },
            # Fee collection stats
            "fee_collection": {
                "paid": StudentFeePayment.objects.filter(status="PAID").count(),
                "pending": StudentFeePayment.objects.filter(status="PENDING").count(),
                "overdue": StudentFeePayment.objects.filter(status="OVERDUE").count(),
            },
            # Upcoming exams
            "upcoming_exams": Exam.objects.filter(start_time__gte=today).count(),
        }

        return Response(stats)


class RecentStudentsAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = StudentSerializer
    pagination_class = None

    def get_queryset(self):
        return Student.objects.all().order_by("-id")[:5]


class FeeStatsAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Total expected fee from FeeStructure
        total_expected = (
            FeeStructure.objects.aggregate(total=Sum("amount"))["total"] or 0
        )

        # Total collected fee: sum the amount_paid from PaymentTransaction where the linked fee payment is PAID and transaction is SUCCESS
        total_collected = (
            PaymentTransaction.objects.filter(
                student_fee_payment__status="PAID", status="SUCCESS"
            ).aggregate(total=Sum("amount_paid"))["total"]
            or 0
        )

        # Total pending fee: sum the total_amount from StudentFeePayment where status is PENDING
        total_pending_amount = (
            StudentFeePayment.objects.filter(status="PENDING").aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        )

        upcoming_payments_qs = (
            StudentFeePayment.objects.filter(
                status="PENDING", due_date__gte=timezone.now()
            )
            .select_related("fee_structure__fee_category")
            .values("fee_structure__fee_category__name", "total_amount", "due_date")
            .order_by("due_date")[:3]
        )

        upcoming_payments = [
            {
                "category": payment["fee_structure__fee_category__name"],
                "amount": payment["total_amount"],
                "due_date": payment["due_date"],
            }
            for payment in upcoming_payments_qs
        ]

        fee_stats = {
            "total_expected": total_expected,
            "total_collected": total_collected,
            "total_pending_amount": total_pending_amount,
            "upcoming_payments": upcoming_payments,
        }

        return Response(fee_stats)


class RecentTeachersAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = TeacherSerializer
    pagination_class = None

    def get_queryset(self):
        return Teacher.objects.all().order_by("-id")[:5]


class UnpaidFeesAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = FeeStructureSerializer
    pagination_class = None

    def get_queryset(self):
        return FeeStructure.objects.filter(status__in=["PENDING", "OVERDUE"]).order_by(
            "due_date"
        )[:10]


class UpcomingExamsAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ExamSerializer
    pagination_class = None

    def get_queryset(self):
        return Exam.objects.filter(start_time__gte=timezone.now()).order_by(
            "start_time"
        )[:5]


class AttendanceOverviewAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get(self, request):
        today = timezone.now().date()

        # Get attendance by class
        class_attendance = (
            Attendance.objects.filter(date=today)
            .values("section__school_class__class_name")
            .annotate(
                present=Count("id", filter=Q(status="present")),
                absent=Count("id", filter=Q(status="absent")),
                late=Count("id", filter=Q(status="late")),
            )
        )

        return Response(class_attendance)


# =-----------------------------------------------------


class AdminTeacherLeaveRequestListView(generics.ListAPIView):
    serializer_class = AdminTeacherLeaveRequestSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = TeacherLeaveRequest.objects.all().order_by("-applied_on")
        status = self.request.query_params.get("status", None)
        search = self.request.query_params.get("search", None)

        if status:
            queryset = queryset.filter(status=status)
        if search:
            queryset = queryset.filter(
                teacher__user__first_name__icontains=search
            ) | queryset.filter(teacher__user__last_name__icontains=search)
        return queryset


class AdminTeacherLeaveRequestDetailView(generics.RetrieveAPIView):
    serializer_class = AdminTeacherLeaveRequestSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = TeacherLeaveRequest.objects.all()


class AdminLeaveResponseView(generics.UpdateAPIView):
    serializer_class = AdminLeaveResponseSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = TeacherLeaveRequest.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status != "PENDING":
            raise PermissionDenied("This leave request has already been processed")
        serializer.save()


# --------------------------------------


class SchoolAdminProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SchoolAdminProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().patch(request, *args, **kwargs)


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not check_password(serializer.data["current_password"], user.password):
                return Response(
                    {"current_password": "Wrong password."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.data["new_password"])
            user.save()
            return Response({"status": "password changed successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
