from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    ParentViewSet,
    ClassListView,
    SubjectListView,
    ShowStudentsView,
    ParentDetailView,
    StudentBlockView,
    StudentDetailView,
    CreateStudentView,
    TeacherDetailView,
    StudentDeleteView,
    StudentUpdateView,
    AdminClassListView,
    SchoolClassListView,
    AdminAttendanceView,
    SchoolAdminLoginView,
    AdminSectionListView,
    TeacherListCreateView,
    FeeCategoryDetailView,
    ParentBlockUnblockView,
    DeleteClassSectionView,
    TeacherBlockUnblockView,
    GetStudentParentViewSet,
    CreateSchoolClassViewSet,
    FeeStructureDetailedView,
    StudentFeePaymentListView,
    TeacherDocumentDeleteView,
    FeeCategoryListCreateView,
    AssignClassTeacherViewSet,
    AdminMonthlyStatisticsView,
    FeeStructureListCreateView,
    ParentStudentManagementView,
    SchoolClassSectionUpdateView,
    StudentParentRelationshipView,
    # bulk_create_student_fee_payments,
)

router = DefaultRouter()
router.register(r"add_class", CreateSchoolClassViewSet, basename="add-class")
router.register('assign-class-teacher', AssignClassTeacherViewSet, basename="assign-class-teacher")
router.register('parents', ParentViewSet)
router.register('get-student-parent', GetStudentParentViewSet)


urlpatterns = [
    path("login/", SchoolAdminLoginView.as_view(), name="school_admin-login"),
    path("add_students/", CreateStudentView.as_view(), name="add-students"),
    path("list_class/", ClassListView.as_view(), name="list-class"),
    path("students/", ShowStudentsView.as_view(), name="show-students"),
    path("student_info/<int:pk>/", StudentDetailView.as_view(), name="student-info"),
    path("student_update/<int:pk>/", StudentUpdateView.as_view(), name="student-update"),
    path("student_delete/<int:pk>/", StudentDeleteView.as_view(), name="student-delete"),
    path('student_parent_relationship/<int:student_id>/', StudentParentRelationshipView.as_view()),
    path("student_block/<int:pk>/", StudentBlockView.as_view(), name="student-block"),
    
    
    path("classes", SchoolClassListView.as_view(), name='class-list'),
    path("update/class/<int:pk>/section/<int:section_pk>/", SchoolClassSectionUpdateView.as_view(), name='update-class-section'),
    path("class/<int:class_id>/section/<int:section_id>/", DeleteClassSectionView.as_view(), name='delete-class-secion'),
    
    
    path('parents/<int:pk>/', ParentDetailView.as_view(), name='parent-detail'),
    path('parents/<int:pk>/students/', ParentStudentManagementView.as_view(), name='parent-student-management'),
    path('parents/<int:pk>/block/', ParentBlockUnblockView.as_view(), name="parent-block-unblock"),
    
    
    path('teachers/', TeacherListCreateView.as_view(), name='teacher-list-create'),
    path('teachers/<int:pk>/', TeacherDetailView.as_view(), name="teacher-detail-view"),
    path('teacher-documents/<int:pk>/', TeacherDocumentDeleteView.as_view(), name='teacher-document-delete'),
    path('teachers/<int:pk>/block/', TeacherBlockUnblockView.as_view(), name="teacher-block-unblock-view"),
    
    path('subjects/', SubjectListView.as_view(), name="subjects"),
    
    path('student-attendance-history/', AdminAttendanceView.as_view(), name='admin-attendance-history'),
    path('student-statistics/', AdminMonthlyStatisticsView.as_view(), name='admin-monthly-statistics'),
    path('school-classes/', AdminClassListView.as_view(), name='admin-classes'),
    path('school-classes/<int:class_id>/sections/', AdminSectionListView.as_view(), name='admin-sections'),
    
    
    path("fee-categories/", FeeCategoryListCreateView.as_view(), name='fee-category'),
    path('fee-categories/<int:pk>/', FeeCategoryDetailView.as_view(), name='fee-category-detail'),
    
    path('fee-structures/', FeeStructureListCreateView.as_view(), name='fee-structure'),
    path('fee-structures/<int:pk>/', FeeStructureDetailedView.as_view(), name='fee-structure-detail'),
    
    # path('student-fee-payments/bulk-create/', bulk_create_student_fee_payments, name='bulk-create-fee-payments'),
    path('student-fee-payments/', StudentFeePaymentListView.as_view(), name='student-fee-payment-list'),
]

urlpatterns += [
    path("", include(router.urls)),
]