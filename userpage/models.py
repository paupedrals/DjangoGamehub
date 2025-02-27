from django.db import models
from django.contrib.auth.models import User
from games.models import Genre

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorite_genres = models.ManyToManyField(Genre, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class ContactMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        if self.reply_to:
            return f"Reply to: {self.reply_to.title} - {self.user.username}"
        return f"{self.user.username} - {self.title}"
