from django.contrib import admin
from .models import Student, StudentLeaveRequest

# Register your models here.

admin.site.register(Student)
admin.site.register(StudentLeaveRequest)


