import calendar 
from datetime import datetime
from gettext import translation
from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .serializers import AttendanceHistorySerializer, BulkAttendanceSerializer, MonthlyStatisticsSerializer, StudentAttendanceSerializer, StudentInfoSerializer, StudentSerializer
from users.models import CustomUser
from teachers.models import SchoolClass, Section, Teacher, Attendance
from students.models import Student
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from django.db.models.functions import TruncMonth
from django.db.models import Count, Q


# Create your views here.

class TeacherStudentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination
    
    def get(self, request):
        try:
            email = request.query_params.get("email") 
            if not email:
                return Response(
                    {"error": "Email query parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            teacher = get_object_or_404(Teacher, user__email=email)
            # Find sections where the teacher is a class teacher
            sections = Section.objects.filter(class_teacher=teacher)
            
            if not sections.exists():
                return Response(
                    {"error": "You are not assigned as class teacher to any section"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get students assigned to these sections
            students = Student.objects.filter(class_assigned__in=sections).select_related('user')
            
            paginator = self.pagination_class()
            paginated_students = paginator.paginate_queryset(students, request)
            
            serializer = StudentSerializer(paginated_students, many = True)
            
            
            sections_data = []
            for section in sections:
                students_in_section = students.filter(class_assigned=section)
                paginated_students_in_section = paginator.paginate_queryset(students_in_section, request)
                serializer = StudentSerializer(paginated_students_in_section, many=True)
                sections_data.append({
                    "class_name": section.school_class.class_name,
                    "section_name": section.section_name,
                    "students": serializer.data,
                })
            
            return Response(sections_data, status=status.HTTP_200_OK)
        
        except Teacher.DoesNotExist:
            return Response(
                {"error": "Teacher profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class TeacherStudentInfo(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        try:
            student = Student.objects.get(user__id = pk)
            serlaizer = StudentInfoSerializer(student)
            return Response(serlaizer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student does not exist"}, status=status.HTTP_404_NOT_FOUND
            )


# -----------------------------------------------------------------------

# Attendance Section

class ClassStudentListView(generics.ListAPIView):
    serializer_class = StudentAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    def get_queryset(self):
        try:
            teacher = self.request.user.teacher
            section = Section.objects.get(class_teacher = teacher)
            return Student.objects.filter(
                class_assigned=section
            ).select_related('user').order_by('roll_number')
        except Student.DoesNotExist:
            return Student.objects.none()
        
class MarkAttendance(generics.CreateAPIView):
    serializer_class = BulkAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serlaizer = self.get_serializer(data = request.data) 
        if not serlaizer.is_valid():
            return Response(serlaizer.error, status=status.HTTP_400_BAD_REQUEST)
        try:
            teacher = request.user.teacher
            section = Section.objects.get(class_teacher = teacher)
            date = serlaizer.validated_data['date']
            
            if Attendance.objects.filter(section = section, date = date).exists():
                return Response(
                    {"Error" : "Attendance already marked for this date."},
                    status=status.HTTP_400_BAD_REQUEST
                ) 
                
            attendance_record = []
            for attendance_data in serlaizer.validated_data['attendance_data']:
                attendance_record.append(
                    Attendance(
                        student=attendance_data['student'],
                        status=attendance_data['status'],
                        date=date,
                        section=section,
                        marked_by=teacher,
                        academic_year=section.academic_year
                    )
                )
            Attendance.objects.bulk_create(attendance_record)

            return Response(
                {"detail": "Attendance marked successfully"},
                status=status.HTTP_201_CREATED
            )
            
        except Section.DoesNotExist:
            return Response(
                {"error" : "You are not assigned as class teacher to any section"},
                status = status.HTTP_403_FORBIDDEN
            )


class AttendanceHistoryView(generics.ListAPIView):
    serializer_class = AttendanceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        teacher = self.request.user.teacher
        section = Section.objects.get(class_teacher=teacher)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        status = self.request.query_params.get('status')
        weekday = self.request.query_params.get('weekday') 

        queryset = Attendance.objects.filter(section=section) \
            .select_related('student__user').order_by('-date', 'student__roll_number')

        if year and year != 'all':
            queryset = queryset.filter(date__year=int(year))
        
        if month and month != 'all':
            queryset = queryset.filter(date__month=int(month))
        
        if status and status != 'all':
            queryset = queryset.filter(status=status)
            
        if weekday and weekday != 'all':
            # Convert weekday to match database representation
            # Django uses 1 (Sunday) to 7 (Saturday)
            # We'll use 1 (Monday) to 7 (Sunday) in frontend
            weekday_map = {
                '1': 2,  # Monday
                '2': 3,  # Tuesday
                '3': 4,  # Wednesday
                '4': 5,  # Thursday
                '5': 6,  # Friday
                '6': 7,  # Saturday
                '7': 1,  # Sunday
            }
            queryset = queryset.filter(date__week_day=weekday_map[weekday])

        return queryset

class MonthlyStatisticsView(generics.ListAPIView):
    serializer_class = MonthlyStatisticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        teacher = self.request.user.teacher
        section = Section.objects.get(class_teacher=teacher)
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        weekday = self.request.query_params.get('weekday')

        total_students = Student.objects.filter(class_assigned=section).count()

        query = Attendance.objects.filter(section=section)
        
        if year and year != 'all':
            query = query.filter(date__year=int(year))
        
        if month and month != 'all':
            query = query.filter(date__month=int(month))
            
        if weekday and weekday != 'all':
            weekday_map = {
                '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7, '7': 1
            }
            query = query.filter(date__week_day=weekday_map[weekday])

        monthly_stats = query.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            present_count=Count('id', filter=Q(status='present')),
            absent_count=Count('id', filter=Q(status='absent')),
            late_count=Count('id', filter=Q(status='late'))
        ).order_by('month')

        for stat in monthly_stats:
            stat['total_students'] = total_students
            month = stat['month'].month
            year = stat['month'].year
            working_days = self.get_working_days(year, month, weekday)
            
            if working_days > 0:
                expected_attendance = working_days * total_students
                actual_attendance = stat['present_count'] + stat['late_count']
                stat['attendance_percentage'] = (actual_attendance / expected_attendance) * 100
            else:
                stat['attendance_percentage'] = 0

        return monthly_stats

    def get_working_days(self, year, month, weekday=None):
        total_days = calendar.monthrange(year, month)[1]
        working_days = 0
        
        for day in range(1, total_days + 1):
            date = datetime(year, month, day)
            if weekday:
                # If specific weekday is selected, only count those days
                if str(date.isoweekday()) == weekday:
                    working_days += 1
            elif date.weekday() < 5:  # Monday to Friday
                working_days += 1
                
        return working_days
