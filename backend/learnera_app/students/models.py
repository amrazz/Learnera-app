from django.db import models
from teachers.models import AcademicYear, Section, Teacher
from users.models import CustomUser
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


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


class StudentLeaveRequest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    LEAVE_TYPE_CHOICES = [
        ("SICK", "Sick Leave"),
        ("PERSONAL", "Personal Leave"),
        ("FAMILY", "Family Emergency"),
        ("OTHER", "Other"),
    ]

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="leave_requests"
    )
    class_teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="student_leave_requests"
    )
    leave_type = models.CharField(max_length=50, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    supporting_document = models.FileField(
        upload_to="leave_documents/",
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=["pdf", "jpg", "jpeg", "png"])
        ],
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    applied_on = models.DateTimeField(auto_now_add=True)
    response_comment = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-applied_on"]

    def __str__(self):
        return f"{self.student.user.first_name} {self.student.user.last_name} - {self.start_date} to {self.end_date}"

    def clean(self):
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError("End date must be after the start date")
        if self.start_date and self.start_date < timezone.now().date():
            raise ValidationError("Cannot apply for leave in the past")
