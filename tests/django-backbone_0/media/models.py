# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from mucua.models import Mucua
from repositorio.models import Repositorio

TYPE_CHOICES = ( ('audio', 'audio'), ('imagem', 'imagem'), ('video', 'video'), ('arquivo','arquivo') )
FORMAT_CHOICES = ( ('ogg', 'ogg'), ('webm', 'webm'), ('mp4', 'mp4'), ('jpg','jpg') )

def media_file_name(instance, filename):
    return ANNEX_DIR.join([instance.getRepositorio(), instance.getMucua(), 
                           instance.getType(), '%y/%m/%d/'])

class Media(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=36, blank=True)
    title = models.CharField(max_length=100, blank=True, default='')
    comment = models.TextField(max_length=300, blank=True)
    author = models.ForeignKey(User)
    origin = models.ManyToManyField(Mucua)
    type = models.CharField(max_length=14, choices=TYPE_CHOICES, default='arquivo', blank=True)
    format = models.CharField(max_length=14, choices=FORMAT_CHOICES, default='ogg', blank=True)
    license = models.CharField(max_length=100, blank=True)
    mediafile = models.FileField(upload_to=media_file_name, blank=True)
    repositorio = models.ForeignKey(Repositorio)
#    versions = 
#    tags = 
    def __unicode__(self):
        return self.title
    
    def getRepositorio(self):
        return self.repositorio.name

    def getMucua(self):
        return self.origin[0].description

    def getType(self):
        return self.type

    class Meta:
        ordering = ('date',)

    

class MediaForm(ModelForm):
    class Meta:
        model = Media

