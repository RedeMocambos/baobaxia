# -*- coding: utf-8 -*-

from django.db import models
from media.models import Media

class Etiqueta(models.Model):
    namespace = models.CharField(max_length=10, blank=True, default='')
    note = models.TextField(max_length=300)
    etiqueta = models.CharField(max_length=26)
    media = models.ManyToManyField(Media)

    def __unicode__(self):
        return self.namespace + self.etiqueta
    
    class Meta:
        ordering = ('etiqueta',)
        unique_toghether = ("namespace", "etiqueta")

