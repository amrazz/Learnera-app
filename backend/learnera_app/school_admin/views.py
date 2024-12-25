import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets, generics
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    ClassListSerializer,
    SchoolAdminLoginSerializers,
    SchoolAdminStudentSerializers,
    SchoolClassSerializer,
    SchoolClassCreateSerializer,
    SectionSerializer,
    StudentListSerializer,
    StudentDetailSerializer,
)
from .models import AdmissionNumber
from students.models import Student
from teachers.models import SchoolClass, Section
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction


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


# -----------------------------------------------------------------------------


class CreateSchoolClassViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = SchoolClassCreateSerializer
    queryset = SchoolClass.objects.all()

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            school_class = serializer.save()
            
            response_serializer = SchoolClassSerializer(school_class)

            return Response(
                {
                    "message": "Class Created Successfully!!",
                    "data": response_serializer.data
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class SchoolClassListView(generics.ListAPIView):
    queryset = SchoolClass.objects.all().prefetch_related(
        'sections',
        'class_teacher',
        'class_teacher__user'
    )

    serializer_class = ClassListSerializer
    
    def get_queryset(self):
        return super().get_queryset()
    