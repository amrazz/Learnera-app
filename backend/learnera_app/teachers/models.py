from django.db import models
from django.utils import timezone
from users.models import CustomUser
from django.core.validators import FileExtensionValidator
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


class Subject(models.Model):
    subject_name = models.CharField(max_length=100)

    def __str__(self):
        return f"Subject {self.subject_name}"


class AcademicYear(models.Model):
    name = models.CharField(max_length=10)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.name


class SchoolClass(models.Model):
    class_name = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.class_name


class Section(models.Model):
    school_class = models.ForeignKey(
        SchoolClass, on_delete=models.CASCADE, related_name="sections"
    )
    class_teacher = models.ForeignKey(
        "Teacher",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="class_teacher",
    )
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, default=1)
    section_name = models.CharField(max_length=10)
    student_count = models.IntegerField(default=30, null=True, blank=True)
    available_students = models.IntegerField(default=0, null=True, blank=True)

    class Meta:
        unique_together = (
            "school_class",
            "section_name",
        )

    def __str__(self):
        return f"{self.school_class} - {self.section_name}"


class Teacher(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    classes = models.ManyToManyField(SchoolClass, related_name="teachers")
    sections = models.ManyToManyField(Section, related_name="teachers")
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="teachers",
        null=True,
        blank=True,
    )

    def __str__(self):
        subject_name = (
            self.subject.subject_name if self.subject else "No Subject currently."
        )
        return f"{self.user.first_name} {self.user.last_name} - {subject_name}"


class TeacherDocument(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="docs")
    title = models.CharField(max_length=255)
    document = models.FileField(
        upload_to="teacher_documents/",
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.teacher.user.first_name} {self.teacher.user.last_name}"


class Attendance(models.Model):
    ATTENDANCE_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
    ]

    student = models.ForeignKey(
        "students.Student", on_delete=models.CASCADE, related_name="attendance_records"
    )
    section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="attendance_records"
    )
    marked_by = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="attendance_records"
    )
    status = models.CharField(
        max_length=10, choices=ATTENDANCE_CHOICES, default="present"
    )
    academic_year = models.ForeignKey(
        AcademicYear,
        on_delete=models.CASCADE,
        related_name="attendance_records",
        null=True,
        blank=True,
    )
    date = models.DateField()
    marked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["student", "date", "section"]
        ordering = ["-date", "student__roll_number"]

    def __str__(self):
        return f"{self.student.user.first_name} - {self.date} - {self.status}"


class Assignment(models.Model):
    STATUS_CHOICES = [("published", "Published"), ("closed", "Closed")]
    title = models.CharField(max_length=250)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="subject_assignments"
    )
    class_section = models.ForeignKey(
        Section, on_delete=models.CASCADE, related_name="class_assignments"
    )
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="teacher_assignments"
    )
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
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="assignment_submissions"
    )
    student = models.ForeignKey(
        "students.Student", on_delete=models.CASCADE, related_name="student_submissions"
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    work_file = models.FileField(
        upload_to="student_assignments/",
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
    )
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)

    def __str__(self):
        submitted = "Submitted" if self.is_submitted else "Not Submitted"
        return f"{self.student.user.first_name} {self.student.user.last_name} - {self.assignment.title} : {submitted}"


# -------------------------------------------------------------------------


class Exam(models.Model):
    EXAM_STATUS = (
        ("PUBLISHED", "Published"),
        ("ONGOING", "Ongoing"),
        ("COMPLETED", "Completed"),
    )

    title = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    class_section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="exam_class",
        null=True,
        blank=True,
    )
    total_mark = models.PositiveIntegerField()
    duration = models.DecimalField(
        max_digits=5, decimal_places=2, help_text="Duration in minutes"
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    meet_link = models.URLField(max_length=250)
    status = models.CharField(max_length=20, choices=EXAM_STATUS, default="PUBLISHED")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.subject} "

    def is_active(self):
        now = timezone.now()
        return self.start_time <= now <= self.end_time


class Question(models.Model):
    QUESTION_TYPES = (
        ("MCQ", "Multiple Choice Questions"),
        ("ESSAY", "Essay/Descriptive"),
    )

    exam = models.ForeignKey(
        Exam, on_delete=models.CASCADE, related_name="exam_questions"
    )
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    marks = models.PositiveIntegerField()
    order = models.PositiveIntegerField(help_text="Question number/order in exam")

    class Meta:
        ordering = ["order"]


class MCQChoice(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="choice_questions"
    )
    choice_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)


class StudentExam(models.Model):
    EXAM_STATUS = (
        ("NOT_STARTED", "Not Started"),
        ("IN_PROGRESS", "In Progress"),
        ("SUBMITTED", "Submitted"),
        ("EVALUATED", "Evaluated"),
    )

    student = models.ForeignKey("students.Student", on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    start_time = models.DateTimeField(null=True, blank=True)
    submit_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=EXAM_STATUS, default="NOT_STARTED")
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )

    class Meta:
        unique_together = ("student", "exam")


class StudentAnswer(models.Model):
    student_exam = models.ForeignKey(
        StudentExam, on_delete=models.CASCADE, related_name="student_answers"
    )
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer_text = models.TextField(null=True, blank=True)
    selected_choice = models.ForeignKey(
        MCQChoice, on_delete=models.CASCADE, null=True, blank=True
    )
    marks_obtained = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    evaluated_by = models.ForeignKey(
        Teacher, on_delete=models.SET_NULL, null=True, blank=True
    )
    evaluation_comment = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ("student_exam", "question")


# ------------------------------------------


class TeacherLeaveRequest(models.Model):
    LEAVE_TYPE_CHOICES = [
        ("SICK", "Sick Leave"),
        ("PERSONAL", "Personal Leave"),
        ("FAMILY", "Family Emergency"),
        ("OTHER", "Other"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, related_name="leave_requests"
    )
    leave_type = models.CharField(max_length=50, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    supporting_document = models.FileField(
        upload_to="leave_documents/",
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=["pdf", "jpg", "jpeg", "png"])
        ],
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    applied_on = models.DateTimeField(auto_now_add=True)
    response_comment = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-applied_on"]

    def __str__(self):
        return f"{self.student.user.first_name} {self.student.user.last_name} - {self.leave_type} - {self.status}"

    def clean(self):
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError("End date must be after the start date")
        if self.start_date and self.start_date < timezone.now().date():
            raise ValidationError("Cannot apply for leave in the past")
