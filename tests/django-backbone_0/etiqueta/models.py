# -*- coding: utf-8 -*-

from django.db import models

class Etiqueta(models.Model):
    namespace = models.CharField(max_length=10, blank=True, default='')
    note = models.TextField(max_length=300, blank=True)
    etiqueta = models.CharField(max_length=26)
    # triage = 

    def __unicode__(self):
        return self.namespace + self.etiqueta

    def getId(self):
        return self.namespace+' '+self.etiqueta
    
    class Meta:
        ordering = ('etiqueta',)
        unique_together = ("namespace", "etiqueta")
