# -*- coding: utf-8 -*-

import os
import uuid
import logging
from datetime import datetime
import exceptions
from importlib import import_module

from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.utils.translation import ugettext_lazy as _
from django.template.defaultfilters import slugify

from tag.models import Tag
from bbx.settings import REPOSITORY_DIR

try:
    from django.utils.encoding import force_unicode  # NOQA
except ImportError:
    from django.utils.encoding import force_text as force_unicode  # NOQA

TYPE_CHOICES = (('audio', 'audio'), ('imagem', 'imagem'), ('video', 'video'),
                ('arquivo', 'arquivo'))
FORMAT_CHOICES = (('ogg', 'ogg'), ('webm', 'webm'), ('mp4', 'mp4'),
                  ('jpg', 'jpg'), ('pdf', 'pdf'))


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

    return os.path.join(REPOSITORY_DIR, instance.getRepository(),
                        instance.getMucua(), instance.getType(),
                        date)


def getTypeChoices():
    return TYPE_CHOICES


def getFormatChoices():
    return FORMAT_CHOICES


class Media(models.Model):
    uuid = models.CharField(
        _('uuid'),
        help_text=_('Media universal unique identifier'),
        max_length=36, default=_('No UUID'))
    name = models.CharField(_('name'),
                            help_text=_('Media name'),
                            max_length=100, default=_('No title'))
    mediafile = models.FileField(upload_to=mediaFileName, blank=True)
    date = models.DateTimeField(_('date'),
                                help_text=_('Media criation date'))
    note = models.TextField(_('note'),
                            help_text=_('Note.. use as you wish!'),
                            max_length=300, blank=True)
    author = models.ForeignKey(User)
    origin = models.ForeignKey('mucua.Mucua')
    type = models.CharField(
        _('type'),
        help_text=_('Type of the media, like image, document, video, ...'),
        max_length=14, choices=TYPE_CHOICES,
        default='arquivo', blank=True)
    format = models.CharField(
        _('format'),
        help_text=('Format of the media, like ogg, jpg, pdf, ...'),
        max_length=14, choices=FORMAT_CHOICES,
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
    request_code = models.CharField(max_length=100, editable=False, blank=True)
    num_copies = models.IntegerField(
        _('number of copies'), default=1, blank=True,
        help_text=_('Number of copies of the media in the repository'))

    def __init__(self, *args, **kwargs):
        super(Media, self).__init__(*args, **kwargs)
        self._meta.get_field('uuid').default = force_unicode(uuid.uuid4())

    def __unicode__(self):
        return self.name

    def getName(self):
        return self.name

    def getFileName(self):
        return (slugify(self.getName()) + '-' + str(self.uuid[:5]) + '.' +
                self.format)

    def getRepository(self):
        return self.repository.getName()

    def getMucua(self):
        return self.origin.description

    def getType(self):
        return self.type

    def getFormat(self):
        return self.format

    # FIX
    def _set_is_local(self):
        print os.path.join(getFilePath(self), self.getFileName())
        self.is_local = os.path.isfile(os.path.join(getFilePath(self),
                                                    self.getFileName()))

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

    def save(self, *args, **kwargs):
        self._set_is_local()
        super(Media, self).save(*args, **kwargs)

    class Meta:
        ordering = ('date',)


class TagPolicyDoesNotExist(exceptions.Exception):
    def __init__(self, args=None):
        self.args = args


@receiver(post_save, sender=Media)
def startPostSavePolicies(instance, **kwargs):
    """
    Intercepta o sinal de *post_save* de objetos multimedia (*media*) e
    inicializa as policies de post-save
    """

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
                        # TODO: I *assume* this is what is needed.
                        return result
            except TagPolicyDoesNotExist:
                return []
