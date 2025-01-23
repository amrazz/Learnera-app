from django.urls import path
from .views import (
    AssignmentGradeSubmissionView,
    AssignmentListCreateView,
    AssignmentRetrieveUpdateDestroyView,
    AssignmentSubmissionListView,
    ClassListView,
    MarkAttendance,
    SubjectListView,
    TeacherStudentInfo,
    TeacherStudentView,
    ClassStudentListView,
    MonthlyStatisticsView,
    AttendanceHistoryView,
)

urlpatterns = [
    path("student-list/", TeacherStudentView.as_view(), name="student-list"),
    path("student-info/<int:pk>/", TeacherStudentInfo.as_view(), name="student-info"),
    path("class-students/", ClassStudentListView.as_view(), name="class-students"),
    
    
    path("mark-attendance/", MarkAttendance.as_view(), name="mark-attendance"),
    path("attendance-history/", AttendanceHistoryView.as_view(), name="attendance-view"),
    path("monthly-statistics/", MonthlyStatisticsView.as_view(), name="monthly-statistics"),
    
    path("class-list/", ClassListView.as_view(), name='class-list'),
    path("subject-list/", SubjectListView.as_view(), name='subject-list'),
    
    path("assignments/", AssignmentListCreateView.as_view(), name="assignment-list-create"),
    path("assignments/<int:pk>/", AssignmentRetrieveUpdateDestroyView.as_view(), name="assignment-retrieve-update-destroy"),
    
    path("assignments/<int:assignment_id>/submissions/", AssignmentSubmissionListView.as_view(), name="assignment-submissions"),
    path("submissions/<int:pk>/grade/", AssignmentGradeSubmissionView.as_view(), name="grade-submission")
    
]
