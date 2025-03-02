# userpage/urls.py
from django.urls import path
from . import views

app_name = 'userpage'

urlpatterns = [
    path('', views.profile_view, name='profile'),
    path('delete_scores/', views.delete_scores, name='delete_scores'),
    path('admin_dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('delete_user_scores/<int:user_id>/', views.delete_user_scores, name='delete_user_scores'),
    path('contact/', views.contact_form, name='contact_form'),
    path('admin/messages/', views.admin_messages, name='admin_messages'),
    path('user/messages/delete/<int:message_id>/', views.delete_message, name='delete_message'),
    path("user/messages/edit/<int:message_id>/", views.edit_message, name="edit_message"),
    path("admin/messages/reply/<int:message_id>/", views.reply_to_message, name="reply_to_message"),
    path('moderator/', views.moderator_tab, name='moderator_tab'), 
]
