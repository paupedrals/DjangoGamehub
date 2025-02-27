# userpage/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Profile, ContactMessage
from .forms import ContactForm, AdminReplyForm

from games.models import Genre, Score
from django.contrib.auth.models import User

@login_required
def profile_view(request):
    profile = request.user.profile
    genres = Genre.objects.all() 

    if request.method == 'POST' and 'favorite_genres' in request.POST:
        selected_genres = request.POST.getlist('favorite_genres')
        profile.favorite_genres.set(selected_genres)
        return redirect('userpage:profile')
    

    scores = Score.objects.filter(user=request.user).order_by('-created_at')
    messages = ContactMessage.objects.filter(user=request.user).order_by('-created_at')

    context = {
        'profile': profile,
        'genres': genres,
        'scores': scores,
        'messages': messages,
    }
    return render(request, 'userpage/profile.html', context)

@login_required
def contact_form(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            contact_message = form.save(commit=False)
            contact_message.user = request.user
            contact_message.save()
            return redirect('userpage:profile') 
    else:
        form = ContactForm()

    return render(request, "userpage/contact_form.html", {"form": form})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_messages(request):
    """ Allows superusers to view all submitted messages """
    messages = ContactMessage.objects.all().order_by("-created_at")
    return render(request, "userpage/admin_messages.html", {"messages": messages})

@login_required
def delete_message(request, message_id):
    """ Allows users to delete their own messages but NOT admin replies """
    message = get_object_or_404(ContactMessage, id=message_id, user=request.user)

    if message.reply_to:  # If it's a reply, prevent deleting
        return redirect("userpage:profile")

    if request.method == "POST":
        message.delete()
        return redirect("userpage:profile")

    return render(request, "userpage/delete_confirmation.html", {"message": message})

@login_required
def delete_scores(request):
    """ Allows superusers to delete all their own scores """
    if request.method == 'POST' and request.user.is_superuser:
        Score.objects.filter(user=request.user).delete()
    return redirect('userpage:profile')

@login_required
def admin_dashboard(request):
    """ Allows superusers to manage users and view admin tools """
    if not request.user.is_superuser:
        return redirect('userpage:profile')
    
    users = User.objects.all()
    return render(request, 'userpage/admin_dashboard.html', {'users': users})

@login_required
def delete_user_scores(request, user_id):
    """ Allows superusers to delete other users' scores """
    if not request.user.is_superuser:
        return redirect('userpage:profile')

    try:
        user_to_delete = User.objects.get(id=user_id)
        Score.objects.filter(user=user_to_delete).delete()
    except User.DoesNotExist:
        pass  # Optionally handle error here

    return redirect('userpage:admin_dashboard')

@login_required
def edit_message(request, message_id):
    """ Allows users to edit their own messages but NOT admin replies """
    message = get_object_or_404(ContactMessage, id=message_id, user=request.user)

    if message.reply_to:  # If it's a reply, prevent editing
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
@user_passes_test(lambda u: u.is_superuser)
def admin_dashboard(request):
    """ Allows superusers to manage users and view admin tools """
    if not request.user.is_superuser:
        return redirect('userpage:profile')
    
    users = User.objects.all()
    messages = ContactMessage.objects.all().order_by("-created_at")  # Fetch all messages

    return render(request, 'userpage/admin_dashboard.html', {'users': users, 'messages': messages})


@login_required
@user_passes_test(lambda u: u.is_superuser)
def reply_to_message(request, message_id):
    """ Allows an admin to reply to a user's message """
    original_message = get_object_or_404(ContactMessage, id=message_id)

    if request.method == "POST":
        form = AdminReplyForm(request.POST)  # ✅ Now correctly recognized
        if form.is_valid():
            reply = form.save(commit=False)
            reply.user = original_message.user  # Reply is assigned to the original sender
            reply.title = f"Reply to: {original_message.title}"  # Set the title as a reply
            reply.reply_to = original_message  # Link the reply to the original message
            reply.save()
            return redirect("userpage:admin_dashboard")

    else:
        form = AdminReplyForm()

    return render(request, "userpage/reply_form.html", {"form": form, "original_message": original_message})
