from django.urls import path


from .views import (
    AssignmentGradeSubmissionView,
    AssignmentListCreateView,
    AssignmentRetrieveUpdateDestroyView,
    AssignmentSubmissionListView,
    ClassListView,
    EvaluateExamView,
    MarkAttendance,
    QuestionDetailView,
    QuestionListCreateView,
    StudentLeaveRequestDetailView,
    StudentLeaveRequestListView,
    StudentLeaveResponseView,
    SubjectListView,
    TeacherAttendanceOverviewAPIView,
    TeacherExamDetailView,
    TeacherExamListCreateView,
    TeacherExamResultsView,
    TeacherExamSubmissionsView,
    TeacherLeaveRequestDetailView,
    TeacherLeaveRequestListCreateView,
    TeacherPendingAssignmentsAPIView,
    TeacherRecentSubmissionsAPIView,
    TeacherStatsAPIView,
    TeacherStudentInfo,
    TeacherStudentView,
    ClassStudentListView,
    MonthlyStatisticsView,
    AttendanceHistoryView,
    TeacherUpcomingExamsAPIView,
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
    path("submissions/<int:pk>/grade/", AssignmentGradeSubmissionView.as_view(), name="grade-submission"),
    
    
    path('exams/', TeacherExamListCreateView.as_view(), name="teacher-exam-list"),
    path('exams/<int:pk>/', TeacherExamDetailView.as_view(), name="teacher-exam-details"),
    path('exams/<int:exam_id>/questions/', QuestionListCreateView.as_view(), name="question-list"),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name="question-details"),
    path('evaluate/<int:pk>/', EvaluateExamView.as_view(), name='evaluate-answer'),
    path('exams/<int:exam_id>/student-submissions/', TeacherExamSubmissionsView.as_view(), name='teacher-exam-submissions'),
    path('exam-results/', TeacherExamResultsView.as_view(), name="student-exam-results"),
    
    
    path('dashboard/stats/', TeacherStatsAPIView.as_view(), name='teacher-dashboard-stats'),
    path('dashboard/recent-submissions/', TeacherRecentSubmissionsAPIView.as_view(), name='teacher-dashboard-recent-submissions'),
    path('dashboard/pending-assignments/', TeacherPendingAssignmentsAPIView.as_view(), name='teacher-dashboard-pending-assignments'),
    path('dashboard/attendance-overview/', TeacherAttendanceOverviewAPIView.as_view(), name='teacher-dashboard-attendance-overview'),
    path('dashboard/upcoming-exams/', TeacherUpcomingExamsAPIView.as_view(), name='teacher-dashboard-upcoming-exams'),
    
    
    # Teacher's own leave requests from admin
    path('leaves/', TeacherLeaveRequestListCreateView.as_view(), name='teacher-leave-list-create'),
    path('leaves/<int:pk>/', TeacherLeaveRequestDetailView.as_view(), name='teacher-leave-detail'),
    
    # Student leave requests that teacher needs to review
    path('student-leaves/', StudentLeaveRequestListView.as_view(), name='student-leave-list'),
    path('student-leaves/<int:pk>/', StudentLeaveRequestDetailView.as_view(), name='student-leave-detail'),
    path('student-leaves/<int:pk>/respond/', StudentLeaveResponseView.as_view(), name='student-leave-response'),


]