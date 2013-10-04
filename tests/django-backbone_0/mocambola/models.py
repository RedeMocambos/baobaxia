# -*- coding: utf-8 -*-                              

from django.contrib.auth.models import User
from django.db import models
from django.db.models import get_model
from repository.models import Repository, gitAdd, gitCommit
from bbx.settings import REPOSITORY_DIR, MOCAMBOLA_DIR
from mocambola.serializers import UserSerializer
from django.dispatch import receiver
from django.db.models.signals import post_save

import os

def getFilePath(instance):
    return os.path.join(REPOSITORY_DIR, instance.repository.getName(),
                        instance.mucua.getDescription(), MOCAMBOLA_DIR)

class Mocambola(models.Model):
    mucua = models.ForeignKey('mucua.Mucua')
    user = models.ForeignKey(User)
    repository = models.ForeignKey(Repository)
    
    def save(self, *args, **kwargs):
        # Serializar aqui o na post_save
        return super(Mocambola, self).save(*args, **kwargs)



@receiver(post_save, sender=Mocambola)
def MocambolaPostSave(instance, **kwargs):
    """Intercepta o sinal de *post_save* do Mocambola, serialize a adiciona o objeto ao repositorio."""

    serializer = UserSerializer(instance.user)
    mocambolapath = getFilePath(instance)+'/'
    mocamboladata = instance.user.get_username() + '.json'
    fout = open(mocambolapath + mocamboladata, 'w')
    fout.write(str(serializer.getJSON()))
    fout.close()
    gitAdd(mocamboladata, mocambolapath)
    gitCommit(mocamboladata, instance.user.get_username(), instance.user.email, \
                  instance.repository.getPath())

# TODO HIGH: Precisa serializar o user tambem na criaçao e update
# diretamente pelo usuario



