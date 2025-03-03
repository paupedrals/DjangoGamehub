from django import forms
from .models import ContactMessage
from .models import Profile
from django.core.validators import RegexValidator

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'image']

class ContactForm(forms.ModelForm):
    message = forms.CharField(
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9 ?!]+$',
                message='Only letters, numbers, spaces, ?, and ! are allowed.'
            )
        ],
        widget=forms.Textarea(attrs={'class': 'form-control'}),
        label='Message'
    )
    class Meta:
        model = ContactMessage
        fields = ['title', 'message']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'message': forms.Textarea(attrs={'class': 'form-control'}),
        }
    def clean_message(self):
        data = self.cleaned_data['message']
        if "spam" in data.lower():
            raise forms.ValidationError("No spam allowed")
        return data

class AdminReplyForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['message']
        widgets = {
            'message': forms.Textarea(attrs={'class': 'form-control'}),
        }