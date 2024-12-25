from django.db import models
from users.models import CustomUser
from students.models import Student


class Parent(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    students = models.ManyToManyField(Student, related_name="parents", blank=True)
    occupation = models.CharField(max_length=100)


    def __str__(self):
        student_names = ", ".join(student.user.username for student in self.students.all())
        return (f"Parent of: {student_names}" if student_names else "Parent (No students linked)" )