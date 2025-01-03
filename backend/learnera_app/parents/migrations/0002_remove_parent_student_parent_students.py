# Generated by Django 5.0 on 2024-12-21 14:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("parents", "0001_initial"),
        ("students", "0004_alter_student_class_assigned"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="parent",
            name="student",
        ),
        migrations.AddField(
            model_name="parent",
            name="students",
            field=models.ManyToManyField(
                blank=True, related_name="parents", to="students.student"
            ),
        ),
    ]
