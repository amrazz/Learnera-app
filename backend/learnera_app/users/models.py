from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    GENDER_CHOICES = [
        ('M', "Male"),
        ('F', "Female"),
    ]
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True) 
    emergency_contact_number = models.CharField(max_length=15, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, blank=True, null=True) 
    state = models.CharField(max_length=100, blank=True, null=True) 
    district = models.CharField(max_length=100, blank=True, null=True) 
    postal_code = models.CharField(max_length=10, blank=True, null=True) 
    country = models.CharField(max_length=100, blank=True, null=True) 
    created_at = models.DateTimeField(default=timezone.now) 
    updated_at = models.DateTimeField(auto_now=True)
    reset_password = models.BooleanField(default = True, null=True)

    # Role-based Booleans
    is_schooladmin = models.BooleanField(default=False)
    is_teacher = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)
    is_parent = models.BooleanField(default=False)
    
    otp = models.CharField(max_length=6, blank=True,null=True)
    otp_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username
