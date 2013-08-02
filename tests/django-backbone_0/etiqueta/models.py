# -*- coding: utf-8 -*-

from django.db import models

class Etiqueta(models.Model):
    namespace = models.CharField(max_length=10, blank=True, default='')
    note = models.TextField(max_length=300, blank=True)
    etiqueta = models.CharField(max_length=26)
    # triage = 

    def __unicode__(self):
        return self.namespace + ':' + self.etiqueta

    def getId(self):
        return self.namespace + ':' + self.etiqueta

    # receive a tag with namespace and save it correctly
    # - ainda bugado
    # def save(self, *args, **kwargs):
    #     if self.etiqueta.find(':') > 0:
    #         args = self.etiqueta.split(':')
    #         self.namespace = args[0]
    #         self.etiqueta = args[1]
    #     super(Etiqueta, self).save(*args, **kwargs)
    
    class Meta:
        ordering = ('etiqueta',)
        unique_together = ("namespace", "etiqueta")
