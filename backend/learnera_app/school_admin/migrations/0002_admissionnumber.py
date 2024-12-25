# Generated by Django 5.0 on 2024-12-17 05:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("school_admin", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="AdmissionNumber",
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
                ("key", models.CharField(max_length=50, unique=True)),
                ("value", models.CharField(max_length=255)),
            ],
        ),
    ]