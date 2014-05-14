# -*- coding: utf-8 -*-                              

from django.contrib.auth.models import User
from django.db import models
from django.db.models import get_model
from repository.models import Repository, gitAdd, gitCommit
from bbx.settings import REPOSITORY_DIR, MOCAMBOLA_DIR
from mocambola.serializers import UserSerializer
from mucua.models import getAvailableMucuas
from django.dispatch import receiver
from django.db.models.signals import post_save
from urlparse import urlparse
import os
from rest_framework.parsers import JSONParser
from django.utils.translation import ugettext_lazy as _
from bbx.utils import dumpclean
import logging

logger = logging.getLogger(__name__)

def getFilePath(instance):
    return os.path.join(REPOSITORY_DIR, instance.repository.getName(),
                        instance.mucua.getDescription(), MOCAMBOLA_DIR)


def create_user_from_files(repository):
    mucuas = getAvailableMucuas(None, repository)
    
    for mucua in mucuas:
        if not mucua[1] == 'web':
            if not mucua[1] == '':
                mocambola_path = os.path.join(str(REPOSITORY_DIR), str(repository.name), str(mucua[1]), MOCAMBOLA_DIR)

                for jmocambola in os.listdir(mocambola_path):
                    mocambola_json_file = open(os.path.join(mocambola_path, jmocambola))
                    data = JSONParser().parse(mocambola_json_file)
                    u = User()
                    serializer = UserSerializer(u, data=data)
                    
                    if serializer.errors:
                        logger.debug(u"%s %s" % (_('Error deserialing'), serializer.errors))
                    serializer.is_valid()
                    
                    current_user = serializer.object
                    current_user.save()
    

class Mocambola(models.Model):
    mucua = models.ForeignKey('mucua.Mucua')
    user = models.ForeignKey(User, unique=True, related_name='mocambola')
    repository = models.ForeignKey(Repository)

    def __unicode__(self):
        return self.user.username
    
    def save(self, *args, **kwargs):
        # Serializar aqui o na post_save
        return super(Mocambola, self).save(*args, **kwargs)



@receiver(post_save, sender=Mocambola)
def MocambolaPostSave(instance, **kwargs):
    """Intercepta o sinal de *post_save* do Mocambola, serialize a adiciona o objeto ao repositorio."""

    from bbx.utils import check_if_path_exists_or_create
    serializer = UserSerializer(instance.user)
    mocambolapath = getFilePath(instance)+'/'
    mocamboladata = instance.user.get_username() + '.json'
    check_if_path_exists_or_create(mocambolapath)
    fout = open(mocambolapath + mocamboladata, 'w')
    fout.write(str(serializer.getJSON()))
    fout.close()
    gitAdd(mocamboladata, mocambolapath)
    gitCommit(mocamboladata, instance.user.get_username(), instance.user.email, \
                  instance.repository.getPath())

# TODO HIGH: Precisa serializar o user tambem na criaçao e update
# diretamente pelo usuario


@receiver(post_save, sender=User)
def UserPostSave(instance, **kwargs):
    """Intercepta o sinal de *post_save* do User, adiciona mocambola pegando o nome do user."""

    # TODO HIGH: conseguir importar Mucua
    
    mucua_model = get_model('mucua', 'Mucua')
    
    # TODO LOW: substituir por regexp
    # TODO: HIGH: The coupling between username and repository should not be so
    # tight.
    current_mocambola, mucua_repository = instance.username.split("@")
    rep = urlparse('http://' + mucua_repository)
    current_mucua, current_repository, current_tld = rep.hostname.split('.')
    
    mucua = mucua_model.objects.get(description = current_mucua)
    repository = Repository.objects.get(name = current_repository)
    mocambola, created = Mocambola.objects.get_or_create(mucua=mucua, 
                          user=instance,
                          repository=repository)
    
