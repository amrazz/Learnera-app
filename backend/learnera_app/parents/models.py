from django.db import models
from users.models import CustomUser
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
