from django.db import models
from users.models import CustomUser
from django.core.validators import FileExtensionValidator


class Subject(models.Model): 
    subject_name = models.CharField(max_length=100)
    
    def __str__(self): 
        return f"Subject {self.subject_name}"
    
class AcademicYear(models.Model):
    name = models.CharField(max_length=10)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default = False)
    
    class Meta:
        ordering = ['-start_date']
        
    def __str__(self):
        return self.name
    
    
    
class SchoolClass(models.Model):
    class_name = models.CharField(max_length=50, null=True, blank=True) 

    def __str__(self):
        return self.class_name

class Section(models.Model):
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name='sections'
    )
    class_teacher = models.ForeignKey(
        'Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='class_teacher'
    )
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, default=1)
    section_name = models.CharField(max_length=10) 
    student_count = models.IntegerField(default=30, null=True, blank=True)
    available_students = models.IntegerField(default=0, null=True, blank=True)

    class Meta:
        unique_together = ('school_class', 'section_name', )

    def __str__(self):
        return f"{self.school_class} - {self.section_name}"



class Teacher(models.Model): 
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE) 
    classes = models.ManyToManyField(SchoolClass, related_name='teachers') 
    sections = models.ManyToManyField(Section, related_name='teachers')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teachers', null=True, blank=True)    
    
    def __str__(self): 
        subject_name = self.subject.subject_name if self.subject else "No Subject currently."
        return f"{self.user.first_name} {self.user.last_name} - {subject_name}"
    

class TeacherDocument(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='docs')
    title = models.CharField(max_length=255)
    document = models.FileField(
        upload_to='teacher_documents/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])]
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.teacher.user.first_name} {self.teacher.user.last_name}"
    
    

class Attendance(models.Model):
    ATTENDANCE_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late')
    ]
    
    student = models.ForeignKey(
        'students.Student', on_delete=models.CASCADE, related_name='attendance_records'
    )
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name='attendance_records'
    )
    marked_by = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name='attendance_records'
    )
    status = models.CharField(
        max_length=10,
        choices=ATTENDANCE_CHOICES,
        default='present'
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name='attendance_records',
        null=True,
        blank=True
    )
    date = models.DateField()
    marked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'date', 'section']
        ordering = ['-date', 'student__roll_number']
    
    def __str__(self):
        return f"{self.student.user.first_name} - {self.date} - {self.status}"
    

class Assignment(models.Model):
    STATUS_CHOICES = [
        ('published', 'Published'),
        ('closed', 'Closed')
    ]
    title = models.CharField(max_length=250)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="subject_assignments")
    class_section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="class_assignments")
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="teacher_assignments")
    created_date = models.DateTimeField(auto_now_add=True)
    last_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        class_section = f"{self.class_section.school_class.class_name} - {self.class_section.section_name}"
        return f"{self.title} - {class_section} - {self.subject.subject_name}"
    
    def clean(self):
        if self.last_date <= self.created_date:
            raise ValueError("The last date must be after the created date.")
        return super().clean()
    
    
class AssignmentSubmission(models.Model):
    
    is_submitted = models.BooleanField(default=False)
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="assignment_submissions")
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='student_submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    work_file = models.FileField(
        upload_to="student_assignments/",
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])]
    )
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback  = models.TextField(null=True, blank=True)
    
    
    def __str__(self):
        submitted = "Submitted" if self.is_submitted else "Not Submitted"
        return f"{self.student.user.first_name} {self.student.user.last_name} - {self.assignment.title} : {submitted}"    