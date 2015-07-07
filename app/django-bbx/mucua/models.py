# -*- coding: utf-8 -*-

import exceptions
import json
import subprocess
import time

from django.db import models
from django.contrib.auth.models import User
from django.db.utils import DatabaseError
from django.utils.translation import ugettext_lazy as _
from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist

from bbx.settings import DEFAULT_MUCUA, MEDIA_ROOT
from bbx.utils import dumpclean, logger, discover
from repository.models import (get_default_repository, git_ls_remote, git_remote_remove,
                               git_remote_add, git_annex_status, git_annex_group_add, 
                               git_annex_group_del, git_annex_group_list)


def get_default_mucua():
    u"""Retorna a mucua padrão (objeto)"""
    return Mucua.objects.get(description=DEFAULT_MUCUA)

def update_mucuas_list(repository):
    u"""Atualiza a lista de mucuas disponivéis no repositório"""
    mucuas = get_available_mucuas(None, repository)
    for mucua in mucuas:
        mucua_description = str(mucua[1])
        mucua_uuid = str(mucua[0])
        try:
            mucua = Mucua.objects.get(description=mucua_description)
            logger.info("Vi a mucua " + mucua_description + 
                        ", UUID: " + mucua_uuid)
        except Mucua.DoesNotExist:
            m = Mucua(description=mucua_description, uuid=mucua_uuid) 
            m.save()
            logger.info("Criei a mucua " + mucua_description + 
                        ", UUID: " + mucua_uuid)


# Helper function to map repository description to correct 
# mucua name if in the new format.
rpr = lambda s: s[s.find("(")+1:s.find(")")] if "(" in s else s

def get_mucua_from_UUID(uuid=None, repository=None):
    """Retorna a descrição da mucua"""
    if not repository:
        try:
            repository = get_default_repository()
        except DatabaseError:
            return []

    json_repository_status = json.loads(
        git_annex_status(repository.get_path()))

    try:
        description = ''
        for mucua in json_repository_status['semitrusted repositories']:
            if mucua['uuid'] == uuid:
                description = mucua['description']
                
        for mucua in json_repository_status['trusted repositories']:
            if mucua['uuid'] == uuid:
                description = mucua['description']
        return rpr(description)
    except Mucua.DoesNotExists:
        return "Invalid"

def get_available_mucuas(uuid=None, repository=None):
    u"""
    Retorna uma lista de mucuas

    A lista são tuplas com uuid e descrição, por ex.:
    [('41f7a561-9678-437e-8f74-9531e67f2aea','dpadua'), 
    ('72c5d0e9-2bfb-43fb-bf3e-0002602b1844', 'kalakuta-laptop')]

    Atributos:
        uuid: retorna o nome (description) da mucua com 'uuid' 
        repository: retorna a lista de mucuas de 'repository'
    """
    if not repository:
        try:
            repository = get_default_repository()
        except DatabaseError:
            return []

    json_repository_status = json.loads(
        git_annex_status(repository.get_path()))

#    logger.debug(_(u"JSON Repository status: %s") % json_repository_status)

    mucuas = []

    if uuid:
        for mucua in json_repository_status['semitrusted repositories']:
            if mucua['uuid'] == uuid:
                mucuas.append(mucua['description'])
        for mucua in json_repository_status['trusted repositories']:
            if mucua['uuid'] == uuid:
                mucuas.append(mucua['description'])
                
    else:
        mucuas.extend([(mucua['uuid'], mucua['description'])
                       for mucua 
                       in json_repository_status['semitrusted repositories']])
        mucuas.extend([(mucua['uuid'], mucua['description'])
                       for mucua 
                       in json_repository_status['trusted repositories']])

    mucuas =  [(m[0], rpr(m[1].replace('[','').replace(']',''))) for m in mucuas]
    mucuas = sorted(mucuas, key=lambda x: x[1])
#    logger.debug(u'Mucuas: %s' % mucuas)
    return mucuas

def get_mucua_info(uuid, repository=None):
    if not repository:
        try:
            repository = get_default_repository()
        except DatabaseError:
            return []

    status = git_annex_status(repository.get_path())
    
    return status

""" return mucua disk in Gigabytes """
def get_mucua_disk():
    df = subprocess.Popen(["df", MEDIA_ROOT], stdout=subprocess.PIPE)
    output = df.communicate()[0]
    data = []
    data.append(float(output.split("\n")[1].split()[1]) / 1024 / 1024)  # size
    data.append(float(output.split("\n")[1].split()[2]) / 1024 / 1024)  # used
    return data


class MucuaDoesNotExists(ObjectDoesNotExist):
    def __init__(self, args=None):
        self.args = args


class MucuaAdmin(admin.ModelAdmin):
    readonly_fields = ('uuid',)


class Mucua(models.Model):
    u"""
    Classe de definição dos objetos Mucua

    Atributos
    description: nome da mucua
    note: anotações livres
    uuid: identificador univoco da 'mucua'
    repository: relação com objeto 'repository'
    mocambolas: relação com objeto 'mocambola'
    """

    description = models.CharField(max_length=100, editable=False)
    note = models.TextField(max_length=300, blank=True)
    uuid = models.CharField("Mucua", max_length=36,
                            choices=get_available_mucuas(),
                            default='dandara')
    repository = models.ManyToManyField('repository.Repository')
    mocambolas = models.ManyToManyField(User, through='mocambola.Mocambola')
    mucuas = models.ManyToManyField('Mucua', through='Rota', 
                                    related_name='linked_mucuas')

    uri_backend = models.CharField("Remote access to mucua", max_length=2048, default="")

    def get_description(self):
        return self.description

    def get_groups(self, repository):
        u"""Retorna a lista de grupos da mucua"""

        if not repository:
            try:
                repository = get_default_repository()
            except DatabaseError:
                return []
        

        return [group for group in git_annex_group_list(repository.get_path(),
                                                        self.uuid) 
                if not group.startswith('t:')]

    def add_group(self, group, repository):
        u"""Retorna a lista de grupos da mucua"""
        if not repository:
            try:
                repository = get_default_repository()
            except DatabaseError:
                return []

        git_annex_group_add(repository.get_path(),
                            self.get_description(),
                            group)

    def del_group(self, group, repository):
        if not repository:
            try:
                repository = get_default_repository()
            except DatabaseError:
                return []

        git_annex_group_del(repository.get_path(),
                            self.get_description(),
                            group)


    def get_territory(self, repository):
        u"""Retorna o territorio da mucua"""
        if not repository:
            try:
                repository = get_default_repository()
            except DatabaseError:
                return []

        groups = git_annex_group_list(repository.get_path(),
                                      self.uuid)
        territory = ''
        for group in groups:
            if group.startswith('t:'):
                territory = group

        return territory[2:]
          
    def set_territory(self, territory, repository):
        u"""Define o territorio da mucua"""
        if not repository:
            try:
                repository = get_default_repository()
            except DatabaseError:
                return []

        actual_territory = self.get_territory(repository)
        if actual_territory != '':
            if territory.startswith('t:'):
                git_annex_group_add(repository.get_path(),
                                    self.get_description(),
                                    territory)
                return _("Mucua enraizada em " + territory)
            else:
                logger.debug('Not a territory.. should start with t:')
                return _("O territorio precisa ser indicado como 't:Nome_do_territorio'")
        else: 
            return _("A mucua esta já enraizada em " + actual_territory)

    def del_territory(self, territory, repository):
        if not repository:
            try:
                repository = get_default_repository()
            except DatabaseError:
                return []

        git_annex_group_del(repository.get_path(),
                            self.get_description(),
                            territory)
       
    def save(self, *args, **kwargs):
        self.description = get_mucua_from_UUID(uuid=self.uuid)
        super(Mucua, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.description

    class Meta:
        ordering = ('description',)


class Rota(models.Model):
    u"""
    Classe de definição dos objetos Rota

    Atributos
    description: nome da rota
    is_active: flag rota ativa
    is_available: flag rota funcionando
    weight: prioridade/velocidade da rota
    """
    mucua = models.ForeignKey(Mucua, related_name='rota_mucuas')
    mucuia = models.ForeignKey(Mucua, related_name='rota_mucuias')
    description = models.CharField(max_length=100)
    is_active = models.BooleanField(default=False)
    is_available = models.BooleanField(default=False)
    weight = models.CharField(max_length=100, default="100")

    def check_and_set_remotes(self):
        if get_default_mucua() == self.mucua:
            r_mucua = self.mucuia
        else:
            r_mucua = self.mucua
            
        remotes = discover()
        logger.debug("Mucuas" + str(remotes))
        access_URI = remotes.get(r_mucua.uuid, "")
        
        if access_URI != "":
            remote = access_URI
        elif r_mucua.uri_backend != "":
            remote = r_mucua.uri_backend
        else:
            remote = ""
        
        logger.debug("Remote" + str(remotes))

        try:
            repository = get_default_repository()
        except DatabaseError:
            pass

        git_remote_remove(r_mucua.uuid, repository.get_path())
        if remote != "": 
            logger.debug("Adicionando " + str(remote) + " em " + str(repository.get_path()))
            git_remote_add(r_mucua.uuid, remote, repository.get_path())
        
        if remote != "" and git_ls_remote(remote, repository.get_path()) == 0:
            self.is_available = True
        else:
            self.is_available = False
        
    def disable():
        self.is_active = False

    def save(self, *args, **kwargs):
        self.check_and_set_remotes()
        super(Rota, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.description

    class Meta:
        ordering = ('description',)
    
