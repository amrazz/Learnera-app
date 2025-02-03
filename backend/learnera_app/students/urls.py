from django.urls import path
from .views import AssignmentSubmissionView, StartExamView, StudentAnswerCreateView, StudentAnswerUpdateView, StudentAssignmentListView, StudentDashboard, StudentExamPreparationView, StudentExamListView, StudentExamResultsView, SubmitExamView

urlpatterns = [
    path('assignments/', StudentAssignmentListView.as_view(), name="student-assignment"),
    path("assignments/<int:assignment_id>/submit/", AssignmentSubmissionView.as_view(), name="submit-assignment"),
    
    path('exams/', StudentExamListView.as_view(), name='student-exam-list'),
    path('exams/<int:exam_id>/', StudentExamPreparationView.as_view(), name='student-detail-list'),
    path('exams/<int:exam_id>/start/', StartExamView.as_view(), name='start-exam'),
    path('exams/<int:exam_id>/submit/', SubmitExamView.as_view(), name='submit-exam'),
    path('answers/', StudentAnswerCreateView.as_view(), name='create-answer'),
    path('answers/<int:pk>/', StudentAnswerUpdateView.as_view(), name='update-answer'),
    path('my-results/', StudentExamResultsView.as_view(), name="my-result"),
    path("student-dashboard/", StudentDashboard.as_view(), name="student-dashboard"),
]
