from django.urls import path
from .views import (
    MarkAttendance,
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
]
