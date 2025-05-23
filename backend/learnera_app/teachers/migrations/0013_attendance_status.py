# Generated by Django 5.0 on 2025-01-13 13:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("teachers", "0012_attendance"),
    ]

    operations = [
        migrations.AddField(
            model_name="attendance",
            name="status",
            field=models.CharField(
                choices=[
                    ("present", "Present"),
                    ("absent", "Absent"),
                    ("late", "Late"),
                ],
                default="present",
                max_length=10,
            ),
        ),
    ]
