from django.db import transaction
from django.core.exceptions import ValidationError
from students.models import Student
from loguru import logger  # type: ignore


class RollNumberService:
    @staticmethod
    @transaction.atomic
    def assign_roll_number(student, section, academic_year):
        """
        Assigns a roll number to a new student and reorders all students in the same section
        and academic year based on their first and last names.
        """
        try:
            logger.info(
                f"Starting roll number assignment for student: {student.user.first_name} {student.user.last_name}"
            )
            logger.info(
                f"Section ID: {section.id}, Academic Year ID: {academic_year.id}"
            )

            # Save the student if not already saved
            if not student.pk:
                logger.info(
                    f"New student detected, saving first: {student.user.first_name}"
                )
                student.save()

            # Get all students in the EXACT same section and academic year
            students = list(
                Student.objects.select_for_update()
                .filter(class_assigned_id=section.id, academic_year_id=academic_year.id)
                .order_by("user__first_name", "user__last_name")
            )

            logger.info(
                f"Found {len(students)} students in section {section.id} for academic year {academic_year.id}"
            )

            # logger.info current students for debugging
            for s in students:
                logger.info(
                    f"Student ID: {s.id}, Name: {s.user.first_name} {s.user.last_name}, "
                    + f"Section: {s.class_assigned.id}, Current Roll: {s.roll_number}"
                )

            # Temporarily set all roll numbers in THIS section and THIS academic year to NULL to avoid conflicts
            logger.info(
                f"Temporarily setting roll numbers to NULL for section {section.id}, academic year {academic_year.id}"
            )
            Student.objects.filter(
                class_assigned_id=section.id, academic_year_id=academic_year.id
            ).update(roll_number=None)

            # Re-query to get the students with NULL roll numbers
            students = list(
                Student.objects.select_for_update()
                .filter(class_assigned_id=section.id, academic_year_id=academic_year.id)
                .order_by("user__first_name", "user__last_name")
            )

            # Assign roll numbers based on alphabetical order
            for index, s in enumerate(students, start=1):
                s.roll_number = index
                logger.info(
                    f"Student: {s.user.first_name} {s.user.last_name} - New roll: {index}"
                )

            # Use bulk_update for better performance
            logger.info("Performing bulk update of roll numbers")
            Student.objects.bulk_update(students, ["roll_number"])

            # Refresh the student to get the updated roll number
            student.refresh_from_db()
            logger.info(
                f"Final roll number assigned to {student.user.first_name}: {student.roll_number}"
            )

            return student.roll_number

        except Exception as e:
            logger.info(f"ERROR in assign_roll_number: {str(e)}")
            transaction.set_rollback(True)
            raise ValidationError(f"Failed to assign roll number: {str(e)}")

    @staticmethod
    @transaction.atomic
    def reorder_by_name(section, academic_year):
        """
        Reorders roll numbers for all students in the given section and academic year
        based on the alphabetical order of their first and last names.
        """
        try:
            logger.info(
                f"Starting roll number reordering for section {section.id}, year {academic_year.id}"
            )

            # Temporarily set all roll numbers in THIS section and THIS academic year to NULL
            logger.info(
                f"Temporarily setting roll numbers to NULL for section {section.id}, academic year {academic_year.id}"
            )
            Student.objects.filter(
                class_assigned_id=section.id, academic_year_id=academic_year.id
            ).update(roll_number=None)

            # Get all students in the specific section and academic year
            students = list(
                Student.objects.select_for_update()
                .filter(class_assigned_id=section.id, academic_year_id=academic_year.id)
                .order_by("user__first_name", "user__last_name")
            )

            logger.info(f"Found {len(students)} students to reorder")

            if not students:
                logger.info("No students found for reordering")
                return

            # Debug logger.info all students
            for s in students:
                logger.info(
                    f"Student ID: {s.id}, Name: {s.user.first_name} {s.user.last_name}, "
                    + f"Section: {s.class_assigned.id}, Current Roll: {s.roll_number}"
                )

            # Reset and reassign roll numbers
            for index, student in enumerate(students, start=1):
                student.roll_number = index
                logger.info(
                    f"Student: {student.user.first_name} {student.user.last_name} - New roll: {index}"
                )

            # Use bulk_update for better performance
            logger.info("Performing bulk update of roll numbers")
            Student.objects.bulk_update(students, ["roll_number"])

            logger.info(f"Successfully reordered {len(students)} students")

        except Exception as e:
            logger.info(f"ERROR in reorder_by_name: {str(e)}")
            transaction.set_rollback(True)
            raise ValidationError(f"Failed to reorder roll numbers: {str(e)}")
