# -*- coding: utf-8 -*-

import os
import uuid
from datetime import datetime
import exceptions
from importlib import import_module
import subprocess
import json
import re

from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.utils.translation import ugettext_lazy as _
from django.template.defaultfilters import slugify
from django.utils.functional import lazy

from tag.models import Tag
from bbx.settings import REPOSITORY_DIR, DEFAULT_MUCUA
from bbx.utils import logger
from repository.tasks import git_annex_get



try:
    from django.utils.encoding import force_unicode  # NOQA
except ImportError:
    from django.utils.encoding import force_text as force_unicode  # NOQA

TYPE_CHOICES = (('audio', 'audio'), ('imagem', 'imagem'), ('video', 'video'),
                ('arquivo', 'arquivo'))
FORMAT_CHOICES = (('ogg', 'ogg'), ('ogv', 'ogv'), ('webm', 'webm'), ('mp4', 'mp4'),
                  ('jpg', 'jpg'), ('png', 'png'), ('pdf', 'pdf'), ('gif', 'gif'), ('odp', 'odp'), ('odt', 'odt'))


def media_file_name(instance, file_name):
    """Retorna o caminho, completo de nome, do media"""
    logger.debug(os.path.join(get_file_path(instance) + instance.get_file_name()))
    return os.path.join(get_file_path(instance), instance.get_file_name())

def media_file_rename(instance, new_file_name):
    u"""Renomeia o media no repositório."""
    logger.info('Media renamed: ' + new_file_name)
    cmd = 'git mv ' + os.path.basename(instance.media_file.name) + new_file_name
    pipe = subprocess.Popen(cmd, shell=True, cwd=get_file_path(instance))
    pipe.wait()

def generate_UUID():
    """Gera um uuid4"""
    return str(uuid.uuid4())  

def get_file_path(instance):
    """Retorna o caminho do media"""
    return os.path.join(REPOSITORY_DIR, get_media_path(instance))

def get_media_path(instance):
    # FIX: se mudar a data quebra o path
    if instance.date == '':
        t = datetime.now
        date = t.strftime("%y/%m/%d/")
    else:        
        if isinstance(instance.date, unicode):
            date = datetime(year = int(instance.date[:4]),
                            month = int(instance.date[5:7]),
                            day = int(instance.date[8:10]))
            date = date.strftime("%y/%m/%d/")
            """        date = datetime(instance.date)"""
        else:
            date = instance.date.strftime("%y/%m/%d/")
    
    return os.path.join(instance.get_repository(), instance.get_mucua(), 
                        instance.get_type(), date)

def getTypeChoices():
    """Retorna uma tupla com os tipos de media suportados"""
    return TYPE_CHOICES


def getFormatChoices():
    """Retorna uma tupla com os tipos de arquivo suportado"""
    return FORMAT_CHOICES


class Media(models.Model):
    """
    Classe de definição dos objetos multimedia.

    Atributos
    uuid: identificador univoco do media
    name: nome do media
    media_file: relação com arquivo
    url: url do arquivo
    date: data do media
    note: anotações livres
    author: relação com objeto user
    origin: relação com objeto mucua
    type: tipo de media
    format: formato do arquivo
    license: licença do media
    repository: relação com objeto repository
    tags: etiquetas do media
    is_local:  sinaliza que tem uma copia local do media
    is_requested: sinaliza que foi solicitada uma copia local 
                  do media
    request_code: identifica o pedido de copia local
    num_copies: numero de copias desse media no bbx
    """
    uuid = models.CharField(
        _('uuid'),
        help_text=_('Media universal unique identifier'),
        max_length=36, default=_('No UUID'))
    name = models.CharField(_('name'),
                            help_text=_('Media name'),
                            max_length=100, default=_('No title'))
    media_file = models.FileField(upload_to=media_file_name, blank=True)
    url = models.URLField(_('URL'), editable=False)
    date = models.DateTimeField(_('date'),
                                help_text=_('Media creation date'))
    last_modified = models.DateTimeField(_('last modified'),
                                           default=datetime.now(),
                                           help_text=_('Last change'))
    note = models.TextField(_('note'),
                            help_text=_('Note.. use as you wish!'),
                            max_length=300, blank=True)
    author = models.ForeignKey(User)
    origin = models.ForeignKey('mucua.Mucua')
    type = models.CharField(
        _('type'),
        help_text=_('Type of the media, like image, document, video, ...'),
        max_length=14, choices=lazy(getTypeChoices, tuple)(),
        default='arquivo', blank=True)
    format = models.CharField(
        _('format'),
        help_text=('Format of the media, like ogg, jpg, pdf, ...'),
        max_length=14, choices=lazy(getFormatChoices, tuple)(),
        default='ogg', blank=True)
    license = models.CharField(
        _('license'),
        help_text=_('License of the media, like, cc, gpl, bsd, ...'),
        max_length=100, blank=True)
    repository = models.ForeignKey('repository.Repository')
    tags = models.ManyToManyField(Tag)

    is_local = models.BooleanField(
        _('is local'),
        help_text=_('True if media content is available locally'),
        default=False)
    is_requested = models.BooleanField(
        _('is requested'),
        help_text=_('True if media content is awaiting a local copy'),
        default=False)
    # FIX: request_code desnessesario.. usando o uuid mesmo
    request_code = models.CharField(max_length=100, editable=False, blank=True)
    num_copies = models.IntegerField(
        _('number of copies'), default=1, blank=True,
        help_text=_('Number of copies of the media in the repository'))

    def __init__(self, *args, **kwargs):
        super(Media, self).__init__(*args, **kwargs)
        self._meta.get_field('uuid').default = force_unicode(uuid.uuid4())

    def __unicode__(self):
        return self.name

    def get_name(self):
        return self.name

    def get_url(self):
        return '/media/' + get_media_path(self) + self.get_file_name()

    def get_file_name(self):
        if self.pk is None:
            return (slugify(self.get_name())[:60] + '-' + str(self.uuid[:5]) + '.' +
                    self.format)
        else:
            return os.path.basename(self.media_file.name)

    def get_repository(self):
        return self.repository.get_name()

    def get_mucua(self):
        return self.origin.description

    def get_type(self):
        return self.type

    def get_format(self):
        return self.format

    # FIX (Nao pega na primeira save)
    def set_is_local(self):
        self.is_local = os.path.isfile(os.path.join(get_file_path(self),
                                                    self.get_file_name()))

    def _set_num_copies(self):
        from repository.models import git_annex_where_is
        
        data = git_annex_where_is(self)
        try:
            whereis = json.loads(data)
            self.num_copies = len(whereis[u'whereis'])
        except ValueError:
            self.num_copies = 1

    def where_is(self):
        from repository.models import git_annex_where_is
        
        data = git_annex_where_is(self)
        whereis = json.loads(data)
        
        index = 0
        for item in whereis['whereis']:
            # strip [ or ]  (prevent errors of getting mucuas address like [dpadua])
            mucua_name = re.sub("[\[\]]", "", item['description'])
            whereis['whereis'][index]['description'] = mucua_name
            index += 1
        
        return whereis

    def get_tags(self):
        return self.tags
    

    def drop_copy(self):
        u"""
        Remove a copia local do media

        O media é preservado se tiver um pedido pendente em 
        /repository/mucua/requests/

        """
        requests_path = os.path.join(REPOSITORY_DIR, self.get_repository(),
                                     DEFAULT_MUCUA,
                                     'requests')
        if self.uuid not in os.listdir(requests_path):
            from repository.models import git_annex_drop
            self.is_requested = False
            git_annex_drop(self)
            self.save()
        

    def request_copy(self):
        u"""
        Gera um pedido de copia local do media

        Os pedidos tem um codigo uuid e são gravados em 
        /repository/mucua/requests/uuid

        O arquivo atualmente contem somente o caminho para o media no
        repositorio.

        """
        self.set_is_local()
        if not self.is_local:
            self.is_requested = True
            self.save()
            try:
                requests_path = os.path.join(REPOSITORY_DIR, self.get_repository(), 
                                                DEFAULT_MUCUA,
                                                'requests')
                if not os.path.exists(requests_path):
                    os.makedirs(requests_path)
                
                request_filename = os.path.join(requests_path, self.uuid)
                logger.info("REQUESTING: " + request_filename)
                request_file = open(request_filename, 'a')
                request_file.write(self.media_file.path)
                request_file.close
                # TODO: Need to git add
                logger.debug("ADDING REQUEST: " + os.path.basename(request_filename))
                logger.debug("ADDED ON: " + os.path.dirname(request_filename))
                from repository.models import git_add
                git_add(os.path.basename(request_filename), os.path.dirname(request_filename))
                
            except IOError:
                logger.info(u'Alo! I can\'t write request file!')
            
                logger.debug("get_file_path: " + get_file_path(self))
                logger.debug("media_file.name: " + os.path.basename(self.media_file.name))
        
            async_result = git_annex_get.delay(get_file_path(self), os.path.basename(self.media_file.name))
            #logger.debug(async_result.get)
            #logger.debug(async_result.info)

    def save(self, is_syncing=False, *args, **kwargs):
        self.set_is_local()
        print is_syncing
        if self.pk is not None and self.pk is not "":
            self._set_num_copies()
        self.url = self.get_url()
        last_modified = datetime.now()
        if is_syncing:
            self.is_syncing = True
            super(Media, self).save(*args, **kwargs)
        else:
            self.is_syncing = False
            super(Media, self).save(*args, **kwargs)

    class Meta:
        ordering = ('date',)


class TagPolicyDoesNotExist(exceptions.Exception):
    def __init__(self, args=None):
        self.args = args

class MediaDoesNotExist(exceptions.Exception):
    def __init__(self, args=None):
        self.args = args


@receiver(post_save, sender=Media)
def start_post_save_policies(instance, **kwargs):
    """
    Intercepta o sinal de *post_save* de objetos multimedia (*media*) e
    inicializa as policies de post-save
    """

    # FIX: parece que nao intercepta o sinal quando se cria um Media,
    # somente funciona nos "saves" seguidos. Deve ser um problema de
    # disponibilidade da relaçao com a tag.

    tags = instance.get_tags()

    if tags.all():
        for tag in tags.all():
            try:
                for policy in tag.policies:
                    print policy
                    if "post_save" in policy:
                        policy_module = "policy." + policy
                        module = import_module(policy_module)
                        result = getattr(module, policy)(instance)
                        
                        return result
            except TagPolicyDoesNotExist:
                return []
