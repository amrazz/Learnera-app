from django.db import models
from teachers.models import Section
from users.models import CustomUser


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    admission_number = models.BigIntegerField(unique=True, blank=True, null=True)
    parent_name = models.CharField(max_length=100, null=True, blank=True)
    parent_email = models.EmailField(max_length=200, blank=True, null=True)
    roll_number = models.PositiveIntegerField(unique=True, blank=True, null=True)
    class_assigned = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="students"
    )

    class Meta:
        unique_together = ("roll_number", "class_assigned")

    def __str__(self):
        return f"{self.user.username} (Admission Number: {self.admission_number})"
