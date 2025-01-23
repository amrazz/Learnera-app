from django.urls import path
from .views import ParentListView



urlpatterns = [
    path("student-list/", ParentListView.as_view(), name="parent-list")
]
