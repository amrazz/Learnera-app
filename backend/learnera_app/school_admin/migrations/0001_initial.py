# Generated by Django 5.1.3 on 2024-12-03 17:47

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SchoolAdmin",
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
                ("school_name", models.CharField(max_length=200)),
                ("address", models.TextField()),
                (
                    "school_type",
                    models.CharField(
                        choices=[
                            ("State", "State"),
                            ("CBSE", "CBSE"),
                            ("ICSE", "ICSE"),
                        ],
                        max_length=50,
                    ),
                ),
                (
                    "school_logo",
                    models.ImageField(blank=True, null=True, upload_to="school_logo/"),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
