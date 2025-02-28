from django import forms
from .models import ContactMessage
from .models import Profile

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'image']

class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['title', 'message']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'message': forms.Textarea(attrs={'class': 'form-control'}),
        }

class AdminReplyForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['message']
        widgets = {
            'message': forms.Textarea(attrs={'class': 'form-control'}),
        }
