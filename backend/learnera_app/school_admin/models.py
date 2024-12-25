from django.db import models
from users.models import CustomUser

SCHOOL_TYPE_CHOICES = [
    ("State", "State"),
    ("CBSE", "CBSE"),
    ("ICSE", "ICSE"),
]

class SchoolAdmin(models.Model): 
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) 
    school_name = models.CharField(max_length=200) 
    address = models.TextField() 
    school_type = models.CharField(max_length=50, choices=SCHOOL_TYPE_CHOICES) 
    school_logo = models.ImageField(upload_to='school_logo/', null=True, blank=True) 
    
    def __str__(self): 
        
        return f"name : {self.user.username} - {self.school_name}"



class AdmissionNumber(models.Model):
    key = models.CharField(max_length=50, unique=True)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.key}: {self.value}"