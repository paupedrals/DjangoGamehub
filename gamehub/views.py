# gamehub/views.py
from django.shortcuts import redirect

from django.shortcuts import render
def index(request):
    return render(request, "index.html")
