# Generated by Django 5.1.3 on 2025-02-03 18:52

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name="TeacherStudentChatMessage",
            new_name="UserChatMessage",
        ),
    ]
