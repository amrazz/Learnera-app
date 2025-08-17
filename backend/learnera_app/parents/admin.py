from django.contrib import admin
from .models import (
    FeeCategory,
    FeeStructure,
    Parent,
    PaymentTransaction,
    StudentFeePayment,
    StudentParentRelationship,
)

# Register your models here.


admin.site.register(Parent)
admin.site.register(StudentParentRelationship)
admin.site.register(FeeCategory)
admin.site.register(FeeStructure)
admin.site.register(StudentFeePayment)
admin.site.register(PaymentTransaction)
