# Generated by Django 5.0 on 2025-01-06 10:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("teachers", "0006_teacher_sections"),
    ]

    operations = [
        migrations.AddField(
            model_name="section",
            name="available_students",
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
    ]
