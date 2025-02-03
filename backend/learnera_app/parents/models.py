from django.db import models
from teachers.models import AcademicYear, Section
from users.models import CustomUser
from django.core.exceptions import ValidationError
from students.models import Student


class Parent(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    students = models.ManyToManyField(
        Student, related_name="parents", through="StudentParentRelationship"
    )
    occupation = models.CharField(max_length=100)

    def __str__(self):
        return f"parent : {self.user.first_name} - {self.user.last_name}"


class StudentParentRelationship(models.Model):
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    relationship_type = models.CharField(
        max_length=20,
        choices=(
            ("Father", "Father"),
            ("Mother", "Mother"),
            ("Guardian", "Guardian"),
        ),
    )

    date_added = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["student", "parent"]

    def __str__(self):
        return f"{self.parent.user.first_name} is {self.relationship_type} of {self.student.user.first_name}"



class FeeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null = True)
    
    def __str__(self):
        return self.name
    
    
class FeeStructure(models.Model):
    FEE_TYPE_CHOICES = (
        ('GLOBAL', 'Global Fee'),
        ('SPECIFIC', 'Specific Fee'),
    )
    fee_type = models.CharField(max_length=20, choices=FEE_TYPE_CHOICES, default='GLOBAL')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, blank=True, null=True)
    fee_category  = models.ForeignKey(FeeCategory, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ['academic_year', 'section', 'fee_category']
        
    def clean(self):
        if self.fee_type == 'GLOBAL' and self.section:
            raise ValidationError("Section must be null for global fees.")
        if self.fee_type == 'SPECIFIC' and not self.section:
            raise ValidationError("Section is required for specific fees.")
        
    def __str__(self):
        if self.fee_type == 'GLOBAL':
            return f"{self.fee_category} - Global Fee"
        return f"{self.fee_category} - {self.section} ({self.academic_year})"
    

class StudentFeePayment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue')
    )
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_payments')
    fee_structure = models.ForeignKey(FeeStructure, on_delete = models.CASCADE)
    total_amount = models.DecimalField(decimal_places=2, max_digits=10)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    due_date = models.DateField(null=True, blank=True)
    
    
    #stripe details
    
    stripe_invoice_id = models.CharField(max_length=200, blank=True, null=True, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.student} - {self.fee_structure} - {self.status}"
    
    def is_overdue(self):
        from django.utils import timezone
        return self.status != 'PAID' and timezone.now().date() > self.due_date
    

class PaymentTransaction(models.Model):
    TRANSACTION_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Successful'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('STRIPE', 'Stripe'),
        ('CASH', 'Cash'),
        ('CHEQUE', 'Cheque'),
        ('BANK_TRANSFER', 'Bank Transfer'),
    )
    student_fee_payment = models.ForeignKey(StudentFeePayment, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS_CHOICES, default="PENDING")

    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True, choices=PAYMENT_METHOD_CHOICES)

    def __str__(self):
        return f"{self.student_fee_payment} - {self.amount_paid} - {self.status}"