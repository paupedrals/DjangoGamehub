# gamehub/urls.py
from django.contrib import admin
from django.urls import path, include
from .views import index 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', index, name='index'), 
    path('accounts/', include('HOOOO.urls')),
    path('profile/', include('HIII.urls')),
    path('games/', include('HAAA.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
