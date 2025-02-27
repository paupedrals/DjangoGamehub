# games/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Game, Score

@login_required
def game_list(request):
    fav_genres = request.user.profile.favorite_genres.all()
    games = Game.objects.filter(genre__in=fav_genres)
    return render(request, 'games/game_list.html', {'games': games})

@login_required
def game_detail(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    if request.method == 'POST':
        cheat_score = request.POST.get('cheat_score')
        if cheat_score:
            try:
                cheat_score = int(cheat_score)
                Score.objects.create(user=request.user, game=game, value=cheat_score)
            except ValueError:
                pass
        return redirect('games:game_detail', game_id=game.id)
    return render(request, game.template_name, {'game': game})

@login_required
def global_scoreboard(request):
    scores = Score.objects.select_related('user', 'game').order_by('-value')[:50]
    return render(request, 'games/scoreboard.html', {'scores': scores})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def delete_score(request, score_id):
    score = get_object_or_404(Score, id=score_id)
    if request.method == 'POST':
        score.delete()
    return redirect('games:global_scoreboard')
