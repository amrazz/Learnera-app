from django.db import models
from users.models import CustomUser


class AdmissionNumber(models.Model):
    key = models.CharField(max_length=50, unique=True)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.key}: {self.value}"