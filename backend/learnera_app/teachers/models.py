from django.db import models
from users.models import CustomUser



class Subject(models.Model): 
    subject_name = models.CharField(max_length=100)
    
    def __str__(self): 
        return f"Subject {self.subject_name}"
    
    
class SchoolClass(models.Model):
    class_name = models.CharField(max_length=50, null=True, blank=True) 
    class_teacher = models.ForeignKey(
        'teachers.Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='class_teacher'
    )

    def __str__(self):
        return self.class_name


class Section(models.Model):
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    section_name = models.CharField(max_length=10) 
    student_count = models.IntegerField(default=30, null=True, blank=True)

    class Meta:
        unique_together = ('school_class', 'section_name')

    def __str__(self):
        return f"{self.school_class} - {self.section_name}"



class Teacher(models.Model): 
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) 
    qualifications = models.TextField(blank=True, null=True) 
    classes = models.ManyToManyField(SchoolClass, related_name='teachers') 
    subjects = models.ManyToManyField(Subject, related_name='teachers') 
    
    
    def __str__(self): 
        return f"{self.user.username}"