from django.db import models
from teachers.models import AcademicYear, Section
from users.models import CustomUser


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    admission_number = models.BigIntegerField(unique=True, blank=True, null=True)
    roll_number = models.PositiveIntegerField(blank=True, null=True)
    class_assigned = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="students"
    )
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, default=1)

    class Meta:
        unique_together = ("roll_number", "class_assigned", "academic_year")
        ordering = ["roll_number"]

    def __str__(self):
        return f"{self.user.username} (Admission Number: {self.admission_number})"