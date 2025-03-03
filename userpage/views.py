from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Profile, ContactMessage
from .forms import ContactForm, AdminReplyForm
from games.models import Genre, Score, Game
from django.contrib.auth.models import User
from .decorators import group_required
from django.http import HttpResponse

@login_required
def profile_view(request):
    profile = request.user.profile
    genres = Genre.objects.all()
    scores = Score.objects.filter(user=request.user).order_by('-created_at')
    messages = ContactMessage.objects.filter(user=request.user).order_by('-created_at')
    if request.method == 'POST':
        if 'image' in request.FILES:
            profile.image = request.FILES['image']
            profile.save()
        if 'favorite_genres' in request.POST:
            selected_genres = request.POST.getlist('favorite_genres')
            profile.favorite_genres.set(selected_genres)
            profile.save()
        return redirect('userpage:profile')
    context = {'profile': profile, 'genres': genres, 'scores': scores, 'messages': messages}
    return render(request, 'userpage/profile.html', context)

@login_required
def contact_form(request):
    from django.contrib import messages
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            contact_message = form.save(commit=False)
            contact_message.user = request.user
            contact_message.save()
            messages.success(request, "Message sent successfully")
            return redirect('userpage:profile')
        else:
            messages.error(request, "Please correct the errors below")
    else:
        form = ContactForm()
    return render(request, "userpage/contact_form.html", {"form": form})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_messages(request):
    messages = ContactMessage.objects.all().order_by("-created_at")
    return render(request, "userpage/admin_messages.html", {"messages": messages})

@login_required
def delete_message(request, message_id):
    message = get_object_or_404(ContactMessage, id=message_id, user=request.user)
    if message.reply_to:
        return redirect("userpage:profile")
    if request.method == "POST":
        message.delete()
        return redirect("userpage:profile")
    return render(request, "userpage/delete_confirmation.html", {"message": message})

@login_required
def delete_scores(request):
    if request.method == 'POST' and request.user.is_superuser:
        Score.objects.filter(user=request.user).delete()
    return redirect('userpage:profile')

@login_required
def admin_dashboard(request):
    if not request.user.is_superuser:
        return redirect('userpage:profile')
    users = User.objects.all()
    messages = ContactMessage.objects.all().order_by("-created_at")
    return render(request, 'userpage/admin_dashboard.html', {'users': users, 'messages': messages})

@login_required
def delete_user_scores(request, user_id):
    if not request.user.is_superuser:
        return redirect('userpage:profile')
    try:
        user_to_delete = User.objects.get(id=user_id)
        Score.objects.filter(user=user_to_delete).delete()
    except User.DoesNotExist:
        pass
    return redirect('userpage:admin_dashboard')

@login_required
def edit_message(request, message_id):
    message = get_object_or_404(ContactMessage, id=message_id, user=request.user)
    if message.reply_to:
        return redirect("userpage:profile")
    if request.method == "POST":
        form = ContactForm(request.POST, instance=message)
        if form.is_valid():
            form.save()
            return redirect("userpage:profile")
    else:
        form = ContactForm(instance=message)
    return render(request, "userpage/contact_form.html", {"form": form})

@login_required
@group_required('Moderators')
def delete_user_scores(request, user_id):
    try:
        user_to_delete = User.objects.get(id=user_id)
        Score.objects.filter(user=user_to_delete).delete()
    except User.DoesNotExist:
        pass
    return redirect('profile')

@login_required
@user_passes_test(lambda u: u.groups.filter(name='Moderator').exists())
def moderator_tab(request):
    messages = ContactMessage.objects.all() if request.user.has_perm('userpage.view_contactmessage') else []
    scores = Score.objects.select_related('user', 'game').all() if request.user.has_perm('games.view_score') else []
    if request.method == 'POST':
        if 'delete_contact_message_id' in request.POST and request.user.has_perm('userpage.delete_contactmessage'):
            msg_id = request.POST.get('delete_contact_message_id')
            msg = get_object_or_404(ContactMessage, id=msg_id)
            msg.delete()
            return redirect('userpage:moderator_tab')
        if 'delete_score_id' in request.POST and request.user.has_perm('games.delete_score'):
            score_id = request.POST.get('delete_score_id')
            sc = get_object_or_404(Score, id=score_id)
            sc.delete()
            return redirect('userpage:moderator_tab')
        if request.POST.get('action') == 'add_score' and request.user.has_perm('games.add_score'):
            user_id = request.POST.get('user_id')
            game_id = request.POST.get('game_id')
            value = request.POST.get('value')
            try:
                user_obj = User.objects.get(id=user_id)
                game_obj = Game.objects.get(id=game_id)
                Score.objects.create(user=user_obj, game=game_obj, value=value)
            except (User.DoesNotExist, Game.DoesNotExist, ValueError):
                pass
            return redirect('userpage:moderator_tab')
    context = {'messages': messages, 'scores': scores}
    return render(request, 'moderator_tab.html', context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def reply_to_message(request, message_id):
    original_message = get_object_or_404(ContactMessage, id=message_id)
    if request.method == "POST":
        form = AdminReplyForm(request.POST)
        if form.is_valid():
            reply = form.save(commit=False)
            reply.user = original_message.user
            reply.title = f"Reply to: {original_message.title}"
            reply.reply_to = original_message
            reply.save()
            return redirect("userpage:admin_dashboard")
    else:
        form = AdminReplyForm()
    return render(request, "userpage/reply_form.html", {"form": form, "original_message": original_message})

from django.views import View
from django.http import HttpResponse

class ExampleCBV(View):
    def get(self, request):
        return render(request, 'cbv_example.html')

