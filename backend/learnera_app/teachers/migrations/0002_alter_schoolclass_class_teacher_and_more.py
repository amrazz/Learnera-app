# Generated by Django 5.0 on 2024-12-16 10:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("teachers", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="schoolclass",
            name="class_teacher",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="class_teacher",
                to="teachers.teacher",
            ),
        ),
        migrations.AlterField(
            model_name="teacher",
            name="qualifications",
            field=models.TextField(blank=True, null=True),
        ),
    ]