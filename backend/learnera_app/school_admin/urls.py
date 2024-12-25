from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CreateSchoolClassViewSet,
    SchoolAdminLoginView,
    CreateStudentView,
    ClassListView,
    SchoolClassListView,
    ShowStudentsView,
    StudentDetailView,
    StudentUpdateView,
    StudentBlockView,
    StudentDeleteView
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
    path("classes", SchoolClassListView.as_view(), name='class-list')
]

urlpatterns += [
    path("", include(router.urls)),
]