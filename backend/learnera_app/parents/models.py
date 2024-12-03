from django.db import models
from users.models import CustomUser
from students.models import Student


class Parent(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="parents"
    )
    occupation = models.CharField(max_length=100)

    def __str__(self):
        return f"Parent of {self.student.user.username}"
