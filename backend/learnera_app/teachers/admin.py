from django.contrib import admin
from .models import Subject, SchoolClass, Teacher, Section

# Register your models here.

admin.site.register(Subject)
admin.site.register(SchoolClass)
admin.site.register(Teacher)
admin.site.register(Section)