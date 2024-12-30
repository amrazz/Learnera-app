import json
from .serializers import (
    ParentSerializer,
    SectionSerializer,
    ClassListSerializer,
    SchoolClassSerializer,
    StudentListSerializer,
    StudentDetailSerializer,
    SchoolAdminLoginSerializers,
    SchoolClassUpdateSerializer,
    SchoolClassCreateSerializer,
    SchoolAdminStudentSerializers,
    TeacherSerializer,
)
from django.db import transaction
from parents.models import  Parent
from .models import AdmissionNumber
from students.models import  Student
from .email import send_welcome_main
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from teachers.models import SchoolClass, Section, Teacher
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import permissions, status, viewsets, generics


# STUDENT MANAGEMENT

# --------------------------------------------------------------


class SchoolAdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    print("I am here in admin view")

    def post(self, request, *args, **kwargs):
        serializer = SchoolAdminLoginSerializers(data=request.data)
        print(serializer)
        if serializer.is_valid():
            print("This is valid serializer")
            user = serializer.validated_data["user"]
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
        return Response(
            {"error": "Login Falied", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateStudentView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            admission_number_obj, _ = AdmissionNumber.objects.get_or_create(
                key="admission_number",
                defaults={"value": "200000"},
            )
            admission_number = int(admission_number_obj.value)
            admission_number += 1
            admission_number_obj.value = str(admission_number)
            admission_number_obj.save()

            # Prepare student data
            user_data = json.loads(request.data.get("user", "{}"))
            profile_image = request.FILES.get("profile_image")
            if profile_image:
                user_data["profile_image"] = profile_image

            student_data = {
                "user": user_data,
                "parent_name": request.data.get("parent_name", ""),
                "parent_email": request.data.get("parent_email", ""),
                "admission_number": str(admission_number),
                "class_assigned": request.data.get("class_assigned"),
            }

            serializer = SchoolAdminStudentSerializers(data=student_data)
            if serializer.is_valid():
                student = serializer.save()
                
                send_welcome_main(
                    user_type='student',
                    email = user_data['email'],
                    username=user_data['username'],
                    password=user_data['password']
                )
                return Response(
                    {
                        "message": "Student created successfully",
                        "student_id": student.id,
                        "admission_number": admission_number,
                        "username": user_data["username"],
                        "password": user_data["password"],
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
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
                    return Response(
                        {"error": "Class not found"}, status=status.HTTP_404_NOT_FOUND
                    )

                section_serializer = SectionSerializer(school_class.sections, many=True)
                return Response(section_serializer.data, status=status.HTTP_200_OK)

            school_classes = SchoolClass.objects.prefetch_related("sections").all()
            serializer = SchoolClassSerializer(school_classes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error: {e}")
            return Response(
                {"error": "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST
            )


class ShowStudentsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        try:
            students = Student.objects.select_related(
                "user", "class_assigned", "class_assigned__school_class"
            ).all()
            serializer = StudentListSerializer(students, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StudentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk, *args, **kwargs):
        try:
            student = Student.objects.select_related(
                "user",
                "class_assigned",
                "class_assigned__school_class",
            ).get(user__id=pk)

            serializer = StudentDetailSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StudentUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk, *args, **kwargs):
        try:
            student = Student.objects.get(user__id=pk)

            student_data = {
                k: v
                for k, v in request.data.items()
                if k
                in [
                    "admission_number",
                    "roll_number",
                    "parent_name",
                    "parent_email",
                    "class_assigned",
                ]
            }

            user_data = {
                k: v
                for k, v in request.data.items()
                if k
                in [
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
                ]
            }

            for key, value in student_data.items():
                if key == "class_assigned":
                    student.class_assigned = Section.objects.get(id=value)
                else:
                    setattr(student, key, value)

            if user_data:
                for key, value in user_data.items():
                    setattr(student.user, key, value)
                student.user.save()

            student.save()

            serializer = StudentDetailSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Section.DoesNotExist:
            return Response(
                {"error": "Invalid class assignment"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            print(f"Unexpected error: {e}")
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
        "sections", "class_teacher", "class_teacher__user"
    )

    serializer_class = ClassListSerializer

    def get_queryset(self):
        return super().get_queryset()


class SchoolClassSectionUpdateView(generics.UpdateAPIView):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassUpdateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        section_pk = self.kwargs.get("section_pk")

        if section_pk:
            try:
                context["section_instance"] = Section.objects.get(
                    pk=section_pk, school_class_id=self.kwargs.get("pk")
                )

            except Section.DoesNotExist:
                raise Exception("Section not found")
        return context

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        section_instance = self.get_serializer_context().get("section_instance")

        data = {
            "class_name": request.data.get("class_name"),
            "class_teacher": request.data.get("class_teacher"),
            "section": {
                "section_name": request.data.get("section_name"),
                "student_count": request.data.get("student_count"),
            },
        }

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(ClassListSerializer(instance).data, status=status.HTTP_200_OK)


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


# PARENT MANAGEMENT

# --------------------------------------------------------------------


class ParentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ParentListCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        parents = Parent.objects.all()
        serializer = ParentSerializer(parents, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        try:
            user_data = json.loads(request.data.get("user", "{}"))
            if "profile_image" in request.FILES:
                user_data["profile_image"] = request.FILES["profile_image"]

            data = {
                "user": user_data,
                "occupation": request.data.get("occupation", ""),
            }

            if "student_admission_numbers" in request.data:
                admission_numbers = json.loads(
                    request.data["student_admission_numbers"]
                )
                data["student_admission_numbers"] = admission_numbers
        except json.JSONDecodeError:
            return Response(
                {"error": "Invalid student_admission_numbers format"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        print("this is the parent data : ", data)
        serializers = ParentSerializer(data=data)
        if serializers.is_valid():
            parent = serializers.save()
            send_welcome_main(
                    user_type='parent',
                    email = user_data['email'],
                    username=user_data['username'],
                    password=user_data['password']
                )
            return Response(
                ParentSerializer(parent).data, status=status.HTTP_201_CREATED
            )
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)


class ParentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        parent = get_object_or_404(Parent, pk=pk)
        return parent

    def get(self, request, pk):
        parent = self.get_object(pk)
        serializer = ParentSerializer(parent)
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
                context={"request": request},  # Add request to context
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
        admission_numbers = request.data.get("admission_numbers", [])

        if action not in ["add", "remove"]:
            return Response(
                {"error": "Invalid action. Use 'add' or 'remove'"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            students = Student.objects.filter(admission_number__in=admission_numbers)
            if action == "add":
                parent.students.add(*students)
            else:
                parent.students.remove(*students)

            return Response(ParentSerializer(parent).data, status=status.HTTP_200_OK)
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


# -----------------------------------------------------------------------------

# Teacher management


class TeacherListCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        teacher = Teacher.objects.all()
        serializer = TeacherSerializer(teacher, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):

        user_data = json.loads(request.data.get("user", {}))

        if "profile_image" in request.FILES:
            user_data["profile_image"] = request.FILES["profile_image"]

        data = {
            "user": user_data,
            "qualifications": request.data.get("qualifications", ""),
        }

        serlaizer = TeacherSerializer(data=data)
        print()
        print("This is the teacher serlaizer", serlaizer)
        if serlaizer.is_valid():
            print("is valid")
            teacher = serlaizer.save()
            print("TEACHER", teacher)
            send_welcome_main(
                    user_type='teacher',
                    email = user_data['email'],
                    username=user_data['username'],
                    password=user_data['password']
                )
            return Response(
                TeacherSerializer(teacher).data, status=status.HTTP_201_CREATED
            )
        return Response(serlaizer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(Teacher, pk=pk)

    def get(self, request, pk):
        teacher = self.get_object(pk)
        serlaizer = TeacherSerializer(teacher)
        return Response(serlaizer.data)

    def put(self, request, pk):
        teacher = self.get_object(pk)

        try:
            data = json.loads(request.data.get("data", "{}"))

            if "profile_image" in request.FILES:
                if "user" not in data:
                    data["user"] = {}
                data["user"]["profile_image"] = request.FILES["profile_image"]

            serializer = TeacherSerializer(
                teacher, data=data, partial=True, context={"request": request}
            )

            if serializer.is_valid():
                teacher = serializer.save()
                return Response(
                    TeacherSerializer(teacher, context={"request": request}).data,
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except json.JSONDecodeError:
            return Response(
                {"error": "Invalid JSON data"}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        try:
            teacher = self.get_object(pk)

            with transaction.atomic():
                teacher.user.delete()
                teacher.delete()

            return Response(
                {"message": "Teacher deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
            return Response(
                {"error": "Failed to delete teacher", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


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
