from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CreateSchoolClassViewSet,
    DeleteClassSectionView,
    ParentBlockUnblockView,
    ParentDetailView,
    ParentListCreateView,
    ParentStudentManagementView,
    SchoolAdminLoginView,
    CreateStudentView,
    ClassListView,
    SchoolClassListView,
    SchoolClassSectionUpdateView,
    ShowStudentsView,
    StudentDetailView,
    StudentUpdateView,
    StudentBlockView,
    StudentDeleteView,
    TeacherBlockUnblockView,
    TeacherDetailView,
    TeacherListCreateView
)

router = DefaultRouter()
router.register(r"add_class", CreateSchoolClassViewSet, basename="add-class")



urlpatterns = [
    path("login/", SchoolAdminLoginView.as_view(), name="school_admin-login"),
    path("add_students/", CreateStudentView.as_view(), name="add-students"),
    path("list_class/", ClassListView.as_view(), name="list-class"),
    path("students/", ShowStudentsView.as_view(), name="show-students"),
    path("student_info/<int:pk>/", StudentDetailView.as_view(), name="student-info"),
    path("student_update/<int:pk>/", StudentUpdateView.as_view(), name="student-update"),
    path("student_delete/<int:pk>/", StudentDeleteView.as_view(), name="student-delete"),
    path("student_block/<int:pk>/", StudentBlockView.as_view(), name="student-block"),
    path("classes", SchoolClassListView.as_view(), name='class-list'),
    path("update/class/<int:pk>/section/<int:section_pk>/", SchoolClassSectionUpdateView.as_view(), name='update-class-section'),
    path("class/<int:class_id>/section/<int:section_id>/", DeleteClassSectionView.as_view(), name='delete-class-secion'),
    
    
    path('parents/', ParentListCreateView.as_view(), name='parent-list-create'),
    path('parents/<int:pk>/', ParentDetailView.as_view(), name='parent-detail'),
    path('parents/<int:pk>/students/', ParentStudentManagementView.as_view(), name='parent-student-management'),
    path('parents/<int:pk>/block/', ParentBlockUnblockView.as_view(), name="parent-block-unblock"),
    
    
    path('teachers/', TeacherListCreateView.as_view(), name='teacher-list-create'),
    path('teachers/<int:pk>/', TeacherDetailView.as_view(), name="teacher-detail-view"),
    path('teachers/<int:pk>/block/', TeacherBlockUnblockView.as_view(), name="teacher-block-unblock-view")
]


urlpatterns += [
    path("", include(router.urls)),
]