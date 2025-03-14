# Generated by Django 5.1.3 on 2025-02-11 18:32

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("students", "0008_alter_student_unique_together_and_more"),
        ("teachers", "0025_delete_teacherstudentchatmessage"),
    ]

    operations = [
        migrations.CreateModel(
            name="StudentLeaveRequest",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "leave_type",
                    models.CharField(
                        choices=[
                            ("SICK", "Sick Leave"),
                            ("PERSONAL", "Personal Leave"),
                            ("FAMILY", "Family Emergency"),
                            ("OTHER", "Other"),
                        ],
                        max_length=50,
                    ),
                ),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("reason", models.TextField()),
                (
                    "supporting_document",
                    models.FileField(
                        blank=True,
                        null=True,
                        upload_to="leave_documents/",
                        validators=[
                            django.core.validators.FileExtensionValidator(
                                allowed_extensions=["pdf", "jpg", "jpeg", "png"]
                            )
                        ],
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("PENDING", "Pending"),
                            ("APPROVED", "Approved"),
                            ("REJECTED", "Rejected"),
                        ],
                        default="PENDING",
                        max_length=20,
                    ),
                ),
                ("applied_on", models.DateTimeField(auto_now_add=True)),
                ("response_comment", models.TextField(blank=True, null=True)),
                (
                    "class_teacher",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="student_leave_requests",
                        to="teachers.teacher",
                    ),
                ),
                (
                    "student",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="leave_requests",
                        to="students.student",
                    ),
                ),
            ],
            options={
                "ordering": ["-applied_on"],
            },
        ),
    ]
