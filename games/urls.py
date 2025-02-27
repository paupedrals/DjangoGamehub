# games/urls.py
from django.urls import path
from . import views

app_name = 'games'

urlpatterns = [
    path('', views.game_list, name='game_list'),
    path('<int:game_id>/', views.game_detail, name='game_detail'),
    path('scoreboard/', views.global_scoreboard, name='global_scoreboard'),
    path('scoreboard/delete/<int:score_id>/', views.delete_score, name='delete_score'),
]
