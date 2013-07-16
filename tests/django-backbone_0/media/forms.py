# -*- coding: utf-8 -*-                                                     
from django import forms

class MediaForm(forms.Form):
    mediafile  = forms.FileField(
        label = 'Selecionar um media',
        help_text = 'Somente conteudos em licença e formato livre ;)'
        )
