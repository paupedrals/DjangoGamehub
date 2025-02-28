# gamehub/urls.py
from django.contrib import admin
from django.urls import path, include
from .views import index 
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', index, name='index'), 
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('profile/', include('userpage.urls')),
    path('games/', include('games.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
