from django.db import models
from teachers.models import SchoolClass
from users.models import CustomUser


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    admission_number = models.BigIntegerField(unique=True)
    guardian_name = models.CharField(max_length=100)
    roll_number = models.PositiveIntegerField(unique=True)
    class_assigned = models.ForeignKey(
        SchoolClass, on_delete=models.CASCADE, related_name="students"
    )

    class Meta:
        unique_together = ("roll_number", "class_assigned")

    def __str__(self):
        return f"{self.user.username} (Admission Number: {self.admission_number})"
