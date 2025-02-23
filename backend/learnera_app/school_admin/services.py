from django.db import transaction
from django.db.models import F, Window
from django.core.exceptions import ValidationError
from students.models import Student
from django.db.models.functions import RowNumber
from django.db.models import Max

class RollNumberService:
    @staticmethod
    @transaction.atomic
    def assign_roll_number(student, section, academic_year):
        try:
            with transaction.atomic():
                
                max_roll = Student.objects.filter(
                    class_assigned=section,
                    academic_year=academic_year
                ).aggregate(Max('roll_number'))['roll_number__max']

                new_roll_number = 1 if max_roll is None else max_roll + 1

                Student.objects.filter(id=student.id).update(
                    roll_number=new_roll_number
                )

                student.refresh_from_db()

                if not student.roll_number:
                    raise ValidationError("Failed to assign roll number")

                return student.roll_number

        except Exception as e:
            print(f"Error assigning roll number: {str(e)}")
            raise ValidationError("Failed to assign roll number. Please try again.")

    @staticmethod
    @transaction.atomic
    def reorder_by_name(section, academic_year):
        try:
            students = Student.objects.filter(
                class_assigned=section,
                academic_year=academic_year
            ).order_by('user__first_name', 'user__last_name')
            print("This is the students that we are trying to reorder", students)
            
            students.update(roll_number = None)
            
            for index, student in enumerate(students, 1):
                print(f"student name {student.user.first_name} -- roll_number {student.roll_number}")
                student.roll_number = index
                print(f"NEW student name : {student.user.first_name} -- roll_number: {student.roll_number}")
                student.save()

        except Exception as e:
            print(f"Error reordering roll numbers: {str(e)}")
            raise ValidationError("Failed to reorder roll numbers")