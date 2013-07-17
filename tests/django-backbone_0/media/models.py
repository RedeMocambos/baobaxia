# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from mucua.models import Mucua
from repositorio.models import Repositorio
import os
import uuid
import subprocess
from datetime import datetime

TYPE_CHOICES = ( ('audio', 'audio'), ('imagem', 'imagem'), ('video', 'video'), ('arquivo','arquivo') )
FORMAT_CHOICES = ( ('ogg', 'ogg'), ('webm', 'webm'), ('mp4', 'mp4'), ('jpg','jpg') )
ANNEX_DIR = "/home/befree/annex/tests/"

def media_file_name(instance, filename):
#    print "MediaFileName(instance, filename): "+ instance + filename
    print instance.uuid
    print instance.date
    print instance.repositorio
    print instance.origin
    print "Alo!"
    mediafileuuid = uuid.uuid4()
    t = datetime.now()
    return self._getFilePath(instance)


def _getFilePath(instance):
    print instance.uuid
    print instance.date
    print instance.repositorio
    print instance.origin
    return os.path.join(ANNEX_DIR, instance.getRepositorio(),
                        instance.getMucua(), instance.getType(), 
                        t.strftime("%y/%m/%d/"), instance.getFilename())

    
class Media(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=36, blank=True, default=uuid.uuid4())
    title = models.CharField(max_length=100, blank=True, default='')
    comment = models.TextField(max_length=300, blank=True)
    author = models.ForeignKey(User)
    origin = models.ForeignKey(Mucua, related_name='origin')
    type = models.CharField(max_length=14, choices=TYPE_CHOICES, 
                            default='arquivo', blank=True)
    format = models.CharField(max_length=14, choices=FORMAT_CHOICES, 
                              default='ogg', blank=True)
    license = models.CharField(max_length=100, blank=True)
    mediafile = models.FileField(upload_to=media_file_name, blank=True)
    repositorio = models.ForeignKey(Repositorio, related_name='repositorio')
#    versions = 
#    tags = 
    def __unicode__(self):
        return self.title

    def getFileName(self):
        return self.uuid+'.'+self.format
    
    def getRepositorio(self):
        return self.repositorio.name

    def getMucua(self):
        print 
        return self.origin.description

    def getType(self):
        return self.type

    def getFormat(self):
        return self.format

    def save(self, *args, **kwargs):
        # Git Annex
        cmd = "git annex add " + _getFilePath(self)
        pipe = subprocess.Popen(cmd, shell=True,
                                cwd=os.path.dirname(self.mediafile))
        pipe.wait()
        super(Media, self).save(*args, **kwargs) 

    class Meta:
        ordering = ('date',)
    

class MediaForm(ModelForm):
    class Meta:
        model = Media

