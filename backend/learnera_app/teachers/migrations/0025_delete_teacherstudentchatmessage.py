# Generated by Django 5.1.3 on 2025-02-03 18:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("teachers", "0024_alter_teacherstudentchatmessage_options_and_more"),
    ]

    operations = [
        migrations.DeleteModel(
            name="TeacherStudentChatMessage",
        ),
    ]
