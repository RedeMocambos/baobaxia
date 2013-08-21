# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from mucua.models import Mucua
from etiqueta.models import Etiqueta
from bbx.settings import ANNEX_DIR
#from media.serializers import MediaSerializer
from django.db.models.signals import post_save


import os
import uuid
import logging
import subprocess
from datetime import datetime

TYPE_CHOICES = ( ('audio', 'audio'), ('imagem', 'imagem'), ('video', 'video'), ('arquivo','arquivo') )
FORMAT_CHOICES = ( ('ogg', 'ogg'), ('webm', 'webm'), ('mp4', 'mp4'), ('jpg','jpg') )


def mediaFileName(instance, filename):
    logging.debug(os.path.join(getFilePath(instance) + instance.getFileName()))
    return os.path.join(getFilePath(instance), instance.getFileName())


def generateUUID():
    return str(uuid.uuid4())


def getFilePath(instance):
    if instance.date == '':
        t = datetime.now
        date = t.strftime("%y/%m/%d/")
    else:
        date = instance.date.strftime("%y/%m/%d/")

    t = datetime.now()
    return os.path.join(ANNEX_DIR, instance.getRepository(),
                        instance.getMucua(), instance.getType(), 
                        date)


class Media(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=36, default=generateUUID())
    title = models.CharField(max_length=100, blank=True, default='')
    comment = models.TextField(max_length=300, blank=True)
    author = models.ForeignKey(User)
    origin = models.ForeignKey(Mucua, related_name='origin')
    type = models.CharField(max_length=14, choices=TYPE_CHOICES, 
                            default='arquivo', blank=True)
    format = models.CharField(max_length=14, choices=FORMAT_CHOICES, 
                              default='ogg', blank=True)
    license = models.CharField(max_length=100, blank=True)
    mediafile = models.FileField(upload_to=mediaFileName, blank=True)
    repository = models.ForeignKey('gitannex.Repository', related_name='repository')
    #    versions = 
    tags = models.ManyToManyField(Etiqueta, related_name='tags')
    
    def __unicode__(self):
        return self.title

    def getFileName(self):
        return str(self.uuid)  + '.' + self.format
    
    def getRepository(self):
        return self.repository.repositoryName

    def getMucua(self):
        return self.origin.description

    def getType(self):
        return self.type

    def getFormat(self):
        return self.format

    def getTags(self):
        return self.tags

    class Meta:
        ordering = ('date',)


@receiver(post_save, sender=Media)
def startPostSavePolicies(instance, **kwargs):
    """Intercepta o sinal de *post_save* de objetos multimedia (*media*) e inicializa as policies de post-save"""
    tags = instance.getTags()

    # tags = request.DATA['tags'] if iter(request.DATA['tags']) == True else request.DATA['tags'].split(',')
    for tag in tags:
        try:
            for policy in tag.policies:
                if "postSave" in policy:
                    import sync.policy
                    result = getattr(sync, policy(instance))
        except Media.TagPolicyDoesNotExist
            
