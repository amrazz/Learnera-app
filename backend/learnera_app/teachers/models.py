from django.db import models
from users.models import CustomUser



class Subject(models.Model): 
    subject_name = models.CharField(max_length=100)
    
    def __str__(self): 
        return f"Subject {self.subject_name}"
    
    
    
class SchoolClass(models.Model): 
    class_name = models.CharField(max_length=50)
    section = models.CharField(max_length=50) 
    class_teacher = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, related_name='class_teacher') 
    
    class Meta: 
        unique_together = ('class_name', 'section')
        
    def __str__(self): return f"{self.class_name} - {self.section}"


class Teacher(models.Model): 
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) 
    qualifications = models.JSONField(default=list, blank=True, null=True) 
    classes = models.ManyToManyField(SchoolClass, related_name='teachers') 
    subjects = models.ManyToManyField(Subject, related_name='teachers') 
    
    
    def __str__(self): 
        return f"{self.user.username}"