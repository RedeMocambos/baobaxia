from django import forms

class MediaForm(forms.Form, forms.Files):
#    title = forms.CharField(max_length=50)
    file  = forms.FileField()
