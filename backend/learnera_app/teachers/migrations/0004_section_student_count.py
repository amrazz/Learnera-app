# Generated by Django 5.0 on 2024-12-25 03:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("teachers", "0003_alter_schoolclass_unique_together_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="section",
            name="student_count",
            field=models.IntegerField(blank=True, default=30, null=True),
        ),
    ]
