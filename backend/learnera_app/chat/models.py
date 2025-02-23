from django.db import models
from django.core.exceptions import ValidationError
from users.models import CustomUser

# Create your models here.


class UserChatMessage(models.Model):
    MESSAGE_TYPE = [
        ("text", "Text Message"), 
        ("file", "File Message"),
    ]
    sender = models.ForeignKey(CustomUser, related_name="sent_messages", on_delete=models.CASCADE, null=True, blank=True)
    receiver  = models.ForeignKey(CustomUser, related_name="received_messages", on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_received  = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
        verbose_name = "Teacher-Student Chat Message"
        verbose_name_plural = "Teacher-Student Chat Messages"
        
    def clean(self):
        if self.sender.is_teacher:
            if not (self.receiver.is_student or self.receiver.is_parent):
                raise ValidationError("If sender is teacher, receiver must be student or parent")
        
        if self.sender.is_parent:
            if not self.receiver.is_teacher:
                raise ValidationError("If sender is parent, receiver must be teacher")
        
        if self.sender.is_student:
            if not self.receiver.is_teacher:
                raise ValidationError("If sender is student, receiver must be teacher")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)
        
    
    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username}: {self.message[:10]}"