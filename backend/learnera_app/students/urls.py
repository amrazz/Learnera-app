from django.urls import path
from .views import AssignmentSubmissionView, StudentAssignmentListView

urlpatterns = [
    path('assignments/', StudentAssignmentListView.as_view(), name="student-assignment"),
    path("assignments/<int:assignment_id>/submit/", AssignmentSubmissionView.as_view(), name="submit-assignment")
]
