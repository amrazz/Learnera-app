from datetime import timedelta
from django.http import Http404
from django.utils import timezone
from django.shortcuts import get_object_or_404, render
from .models import Student
from teachers.serializers import ExamSerializer, StudentAnswerSerializer, StudentExamSerializer
from teachers.models import Assignment, AssignmentSubmission, Attendance, Exam, MCQChoice, Question, StudentAnswer, StudentExam
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .serializers import AssignmentSubmissionSerializer, StudentAssignmentListSerializer, StudentExamResultSerializer
from django.db.models import Avg
from django.db.models import Avg, Count, Q

from django.db.models.functions import ExtractMonth


# Create your views here.


class StudentAssignmentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentAssignmentListSerializer
    pagination_class = None

    def get_queryset(self):
        student = self.request.user.student
        return Assignment.objects.filter(
            class_section=student.class_assigned,
            is_active = True,
            status = 'published'
        ).select_related(
            'subject',
            'class_section',
            'class_section__school_class'
        ).prefetch_related(
            'assignment_submissions'
        ).order_by('-created_date')

class AssignmentSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, assignment_id, *args, **kwargs):
        try:
            assignment = Assignment.objects.get(
                id = assignment_id,
                class_section = request.user.student.class_assigned,
                is_active = True,
                status = 'published'
            )
            if assignment.last_date < timezone.now():
                return Response(
                    {'error' : "Assignment submission deadline has passed"},
                    status= status.HTTP_400_BAD_REQUEST
                )
            
            existing_submission = AssignmentSubmission.objects.filter(
                assignment = assignment,
                student = request.user.student,
                is_submitted = True
            ).first()
            
            if existing_submission:
                return Response(
                    {'error' : "Assignment already submitted"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            serializer = AssignmentSubmissionSerializer(
                data = {'assignment' : assignment_id, 'work_file' : request.FILES.get('work_file')},
                context = {'request' : request}
            )
            
            if serializer.is_valid():
                submission = serializer.save()
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        except Assignment.DoesNotExist:
            return Response(
                {'error': 'Assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
            
# ----------------------------------------


class StudentExamListView(generics.ListAPIView):
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'student'):
            student = self.request.user.student
            print("This is the student", student.class_assigned)
            return Exam.objects.filter(
                class_section = student.class_assigned,
            ).order_by("-created_at")
            
class StudentExamPreparationView(generics.RetrieveAPIView):
    serializer_class = ExamSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    def get_object(self):
        if hasattr(self.request.user, 'student'):
            student = self.request.user.student
            exam_id = self.kwargs['exam_id'] 
            try:
                return Exam.objects.get(
                    class_section=student.class_assigned,
                    id=exam_id
                )
            except Exam.DoesNotExist:
                raise Http404("Exam not found")

            
class StartExamView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, exam_id):
        if not hasattr(request.user, 'student'):
            return Response(
                {"error": "Only students can start exams"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        exam = get_object_or_404(Exam, id = exam_id)
        student = request.user.student
        
        if student.class_assigned != exam.class_section:
            return Response(
                {"error": "You are not authorized to take this exam."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        if not exam.is_active():
            return Response(
                {"error": "Exam is not active"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        student_exam, created = StudentExam.objects.get_or_create(
            student=student,
            exam=exam,
            defaults={
                'status': 'IN_PROGRESS',
                'start_time': timezone.now()
            }
        )
        
        if student_exam.status == 'IN_PROGRESS' or student_exam.status == 'SUBMITTED' : 
            return Response({"error" : "You have already attended your exam."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not created and student_exam.status != 'NOT_STARTED':
            return Response(
                {"error" : "Exam is already started."}, status=status.HTTP_400_BAD_REQUEST
            )
            
        serlaizer = StudentExamSerializer(student_exam)
        return Response(serlaizer.data)
    
class SubmitExamView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, exam_id):
        if not hasattr(request.user, 'student'):
            return Response(
                {"error" : "Only students can submit exam."},
                status=status.HTTP_403_FORBIDDEN
            )
        student_exam = get_object_or_404(StudentExam, exam_id = exam_id, student = request.user.student)
        
        if student_exam.status == 'SUBMITTED':
            return Response({
                "error" : "This exam has already been submitted."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        exam_duration = student_exam.exam.duration
        time_elapsed = timezone.now() - student_exam.start_time
        if time_elapsed.total_seconds() / 60 > float(exam_duration):
            student_exam.status = 'SUBMITTED'
            student_exam.submit_time = timezone.now()
            student_exam.save()
            return Response(
                {"message": "Exam auto-submitted due to time limit"},
                status=status.HTTP_200_OK
            )
            
        answer_data = request.data.get('answers', [])
        for answer in answer_data:
            question = get_object_or_404(Question, id = answer['question'])
            answer_data = {
                'question' : question,
                'student_exam' : student_exam
            }
            
            if question.question_type == 'MCQ':
                answer_data['selected_choice'] = get_object_or_404(MCQChoice, id= answer['selected_choice'], question = question)
            else:
                answer_data['answer_text'] = answer['answer_text']
            
            StudentAnswer.objects.create(**answer_data)
            
        student_exam.status = 'SUBMITTED'
        student_exam.submit_time = timezone.now()
        student_exam.save()
        
        serializer = StudentExamSerializer(student_exam)
        return Response(serializer.data)
    
    
class StudentAnswerCreateView(generics.CreateAPIView):
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        student_exam = get_object_or_404(
            StudentExam,
            id=self.request.data.get('student_exam'),
            student=self.request.user.student,
            status='IN_PROGRESS'
        )
        serializer.save(student_exam=student_exam)

class StudentAnswerUpdateView(generics.UpdateAPIView):
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StudentAnswer.objects.filter(
            student_exam__student=self.request.user.student,
            student_exam__status='IN_PROGRESS'
        )
        
class StudentExamResultsView(generics.ListAPIView):
    serializer_class = StudentExamResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'student'):
            return StudentExam.objects.filter(
                student=self.request.user.student,
                status='EVALUATED'
            ).select_related('exam')
        return StudentExam.objects.none()
    


class StudentDashboard(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_student(self):
        try:
            return Student.objects.select_related(
                'user', 'class_assigned', 'academic_year'
            ).get(user=self.request.user)
        except Student.DoesNotExist:
            return None

    def get_attendance_data(self, student):
        current_year = timezone.now().year
        attendance = Attendance.objects.filter(
            student=student,
            date__year=current_year
        ).annotate(
            month=ExtractMonth('date')
        ).values('month').annotate(
            present=Count('id', filter=Q(status='present')),
            absent=Count('id', filter=Q(status='absent')),
            late=Count('id', filter=Q(status='late'))
        ).order_by('month')
        
        return list(attendance)

    def get_assignments_data(self, student):
        now = timezone.now()
        
        # Get pending assignments
        pending = Assignment.objects.filter(
            class_section=student.class_assigned,
            last_date__gte=now,
            status='published'
        ).exclude(
            assignment_submissions__student=student,
            assignment_submissions__is_submitted=True
        ).select_related('subject').order_by('last_date')[:5]

        # Format pending assignments
        pending_assignments = [{
            'subject': ass.subject.subject_name,
            'title': ass.title,
            'due_date': ass.last_date,
            'progress': self.calculate_assignment_progress(ass, student)
        } for ass in pending]

        # Get recent submissions
        submissions = AssignmentSubmission.objects.filter(
            student=student,
            is_submitted=True
        ).select_related('assignment').order_by('-submitted_at')[:5]

        # Format recent submissions
        recent_submissions = [{
            'assignment': sub.assignment.title,
            'submitted_at': sub.submitted_at,
            'grade': float(sub.grade) if sub.grade else None
        } for sub in submissions]

        return pending_assignments, recent_submissions

    def calculate_assignment_progress(self, assignment, student):
        # Simplified progress calculation - can be enhanced based on your needs
        try:
            submission = AssignmentSubmission.objects.get(
                assignment=assignment,
                student=student
            )
            return 100 if submission.is_submitted else 50
        except AssignmentSubmission.DoesNotExist:
            return 0

    def get_upcoming_exams(self, student):
        exams = Exam.objects.filter(
            class_section=student.class_assigned,
            start_time__gte=timezone.now(),
            status='PUBLISHED'
        ).select_related('subject').order_by('start_time')[:5]

        return [{
            'title': exam.title,
            'type': 'Exam',
            'date': exam.start_time,
            'days_left': (exam.start_time.date() - timezone.now().date()).days
        } for exam in exams]

    def get_recent_grades(self, student):
        # Combine grades from both assignments and exams
        assignment_grades = AssignmentSubmission.objects.filter(
            student=student,
            grade__isnull=False
        ).aggregate(avg_grade=Avg('grade'))

        exam_grades = StudentExam.objects.filter(
            student=student,
            total_score__isnull=False
        ).aggregate(avg_grade=Avg('total_score'))

        avg_grade = 0
        total_items = 0

        if assignment_grades['avg_grade']:
            avg_grade += assignment_grades['avg_grade']
            total_items += 1

        if exam_grades['avg_grade']:
            avg_grade += exam_grades['avg_grade']
            total_items += 1

        return round(avg_grade / total_items if total_items > 0 else 0, 2)

    def get_upcoming_deadlines(self, student):
        now = timezone.now()
        
        # Combine assignments and exam deadlines
        assignments = Assignment.objects.filter(
            class_section=student.class_assigned,
            last_date__gte=now
        ).values('title', 'last_date').annotate(
            type=Count('id', filter=Q(id__gt=0))
        )[:3]

        exams = Exam.objects.filter(
            class_section=student.class_assigned,
            start_time__gte=now
        ).values('title', 'start_time').annotate(
            type=Count('id', filter=Q(id__gt=0))
        )[:2]

        deadlines = []
        
        for assignment in assignments:
            deadlines.append({
                'title': assignment['title'],
                'type': 'Assignment',
                'date': assignment['last_date'],
                'days_left': (assignment['last_date'].date() - now.date()).days
            })

        for exam in exams:
            deadlines.append({
                'title': exam['title'],
                'type': 'Exam',
                'date': exam['start_time'],
                'days_left': (exam['start_time'].date() - now.date()).days
            })

        return sorted(deadlines, key=lambda x: x['date'])[:5]

    def get(self, request):
        student = self.get_student()
        if not student:
            return Response(
                {"error": "Student not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all required data
        attendance_data = self.get_attendance_data(student)
        pending_assignments, recent_submissions = self.get_assignments_data(student)
        upcoming_exams = self.get_upcoming_exams(student)
        upcoming_deadlines = self.get_upcoming_deadlines(student)
        recent_grades = self.get_recent_grades(student)

        # Prepare the response
        response_data = {
            'student': {
                'name': f"{student.user.first_name} {student.user.last_name}",
                'profile_image': student.user.profile_image.url if student.user.profile_image else None,
                'initials': f"{student.user.first_name[0]}{student.user.last_name[0]}",
                'class': student.class_assigned.school_class.class_name,
                'section': student.class_assigned.section_name,
                'academic_year': student.academic_year.name,
                'roll_number': student.roll_number
            },
            'attendance': attendance_data,
            'pending_assignments': pending_assignments,
            'upcoming_exams': upcoming_exams,
            'recent_submissions': recent_submissions,
            'upcoming_deadlines': upcoming_deadlines,
            'recent_grades': {
                'average': recent_grades
            }
        }

        return Response(response_data)