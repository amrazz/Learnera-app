from django.utils import timezone
from django.shortcuts import render
from teachers.models import Assignment, AssignmentSubmission
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .serializers import AssignmentSubmissionSerializer, StudentAssignmentListSerializer

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