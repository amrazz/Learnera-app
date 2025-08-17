from django.contrib import admin
from .models import (
    AcademicYear,
    Attendance,
    Exam,
    StudentAnswer,
    StudentExam,
    Subject,
    SchoolClass,
    Teacher,
    Section,
)

# Register your models here.

admin.site.register(Subject)
admin.site.register(SchoolClass)
admin.site.register(Teacher)
admin.site.register(Section)
admin.site.register(AcademicYear)
admin.site.register(Attendance)
admin.site.register(StudentExam)
admin.site.register(StudentAnswer)
