# Generated by Django 5.0 on 2025-01-18 07:52

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("teachers", "0014_attendance_academic_year"),
    ]

    operations = [
        migrations.CreateModel(
            name="Assignment",
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
                ("title", models.CharField(max_length=100)),
            ],
        ),
        migrations.RemoveField(
            model_name="teacher",
            name="subjects",
        ),
        migrations.AddField(
            model_name="teacher",
            name="subjects",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="subject",
                to="teachers.subject",
            ),
        ),
    ]
