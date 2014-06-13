# -*- coding: utf-8 -*-

import exceptions
import json

from django.db import models
from django.contrib.auth.models import User
from django.db.utils import DatabaseError
from django.utils.translation import ugettext_lazy as _
from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist


from bbx.settings import DEFAULT_MUCUA
from bbx.utils import dumpclean
from repository.models import get_default_repository, git_annex_status


def get_default_mucua():
    u"""Retorna a mucua padrão (objeto)"""
    return Mucua.objects.get(description=DEFAULT_MUCUA)

def update_mucuas_list(repository):
    u"""Atualiza a lista de mucuas disponivéis no repositório"""
    mucuas = get_available_mucuas(None, repository)
    for mucua in mucuas:
        print ">>> Mucua description: " + mucua[1]
        print ">>> Mucua uuid: " + mucua[0]
        mucua_description = str(mucua[1])
        mucua_uuid = str(mucua[0])
        try:
            mucua = Mucua.objects.get(description=mucua_description)
            print "Vi a mucuaa"
        except Mucua.DoesNotExist:
            m = Mucua(description=mucua_description, uuid=mucua_uuid) 
            m.save()
            print "Criei a mucua " + mucua_description

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
        return description
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

    mucuas = []

    if uuid:
        for mucua in json_repository_status['semitrusted repositories']:
            if mucua['uuid'] == uuid:
                mucuas.append(mucua['description'])
        for mucua in json_repository_status['trusted repositories']:
            if mucua['uuid'] == uuid:
                mucuas.append(mucua['description'])
        return mucuas
                
    else:
        mucuas.extend([(mucua['uuid'], mucua['description'])
                       for mucua 
                       in json_repository_status['semitrusted repositories']])
        mucuas.extend([(mucua['uuid'], mucua['description'])
                       for mucua 
                       in json_repository_status['trusted repositories']])
        return mucuas

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

    def get_description(self):
        return self.description

    def save(self, *args, **kwargs):
        self.description = get_mucua_from_UUID(uuid=self.uuid)
        super(Mucua, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.description

    class Meta:
        ordering = ('description',)
