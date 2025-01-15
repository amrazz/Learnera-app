# Generated by Django 5.0 on 2025-01-11 09:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("students", "0005_remove_student_parent_email_and_more"),
        ("teachers", "0010_section_academic_year"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="academic_year",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to="teachers.academicyear",
            ),
        ),
    ]
