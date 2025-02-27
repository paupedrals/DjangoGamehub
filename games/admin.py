# games/admin.py
from django.contrib import admin
from .models import Genre, Game, Score

admin.site.register(Genre)
admin.site.register(Game)
admin.site.register(Score)
