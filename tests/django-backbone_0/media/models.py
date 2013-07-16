# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from mucua.models import Mucua

TYPE_CHOICES = ( ('audio', 'audio'), ('imagem', 'imagem'), ('video', 'video'), ('arquivo','arquivo') )
FORMAT_CHOICES = ( ('ogg', 'ogg'), ('webm', 'webm'), ('mp4', 'mp4'), ('jpg','jpg') )

class Media(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=36, blank=True)
    title = models.CharField(max_length=100, blank=True, default='')
    comment = models.TextField(max_length=300, blank=True)
#    author = models.ForeignKey(User, default='befree')
#    origin = models.ManyToManyField(Mucua)
    type = models.CharField(max_length=14, choices=TYPE_CHOICES, default='arquivo', blank=True)
    format = models.CharField(max_length=14, choices=FORMAT_CHOICES, default='ogg', blank=True)
    license = models.CharField(max_length=100, blank=True)
    file = models.FileField(upload_to='/tmp/', blank=True)
#    versions = 
#    tags = 
    def __unicode__(self):
        return self.title
    
    class Meta:
        ordering = ('date',)


class MediaForm(ModelForm):
    class Meta:
        model = Media
