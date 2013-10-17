# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from django.forms import ModelForm
from tag.models import Tag
from bbx.settings import REPOSITORY_DIR, POLICIES_DIR

from django.dispatch import receiver
from django.db.models.signals import post_save
from django.dispatch import receiver

import os
import uuid
import logging
import subprocess
from datetime import datetime
import exceptions
from importlib import import_module

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
    return os.path.join(REPOSITORY_DIR, instance.getRepository(),
                        instance.getMucua(), instance.getType(), 
                        date)


class Media(models.Model):
# FIX: uuid nao muda.. so quando se reinicia a applicaçao :(
    date = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=36, default=generateUUID())
    title = models.CharField(max_length=100, default='')
    comment = models.TextField(max_length=300, blank=True)
    author = models.ForeignKey(User)
    origin = models.ForeignKey('mucua.Mucua', related_name='media')
    type = models.CharField(max_length=14, choices=TYPE_CHOICES, 
                            default='arquivo', blank=True)
    format = models.CharField(max_length=14, choices=FORMAT_CHOICES, 
                              default='ogg', blank=True)
    license = models.CharField(max_length=100, blank=True)
    mediafile = models.FileField(upload_to=mediaFileName, blank=True)
    repository = models.ForeignKey('repository.Repository', related_name='media')
    #    versions = 
    tags = models.ManyToManyField(Tag, related_name='tags')
    
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

    # # perform validation
    # def clean(self):
    #     from django.core.exceptions import ValidationError
    #     try:
    #         self.full_clean()
    #     except ValidationError as e:
    #         # do stuff
    #         print e

    def getTags(self):
        return self.tags

    class Meta:
        ordering = ('date',)

class TagPolicyDoesNotExist(exceptions.Exception):
    def __init__(self,args=None):
        self.args = args


@receiver(post_save, sender=Media)
def startPostSavePolicies(instance, **kwargs):
    """Intercepta o sinal de *post_save* de objetos multimedia (*media*) e inicializa as policies de post-save"""
# FIX: parece que nao intercepta o sinal quando se cria um Media,
# somente funciona nos "saves" seguidos. Deve ser um problema de
# disponibilidade da relaçao com a tag.
    
    tags = instance.getTags()
    if tags.all():
        for tag in tags.all():
            try:
                for policy in tag.policies:
                    print policy
                    if "postSave" in policy:
                        policyModule = "policy." + policy
                        module = import_module(policyModule)
                        result = getattr(module, policy)(instance)
            except TagPolicyDoesNotExist:
                return []
