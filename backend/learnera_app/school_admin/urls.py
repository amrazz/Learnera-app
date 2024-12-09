from django.urls import path
from .views import SchoolAdminListCreateView



urlpatterns = [
    path('school_admins/', SchoolAdminListCreateView.as_view(), name='school_admin_list_create')
]

