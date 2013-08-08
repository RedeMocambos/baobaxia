# -*- coding: utf-8 -*-

from django.db import models

class Etiqueta(models.Model):
    namespace = models.CharField(max_length=10, blank=True, default='')
    note = models.TextField(max_length=300, blank=True)
    etiqueta = models.CharField(max_length=26)
    # triage = 

    def __unicode__(self):
        return self.namespace + ":" + self.etiqueta if self.namespace != '' else self.etiqueta 

    def getId(self):
        return self.namespace + ":" + self.etiqueta if self.namespace != '' else self.etiqueta 

    def setNamespace(self):
        if self.etiqueta.find(':') > 0:
            args = self.etiqueta.split(':')
            self.namespace = args[0]

    def setEtiqueta(self):
        if self.etiqueta.find(':') > 0:
            args = self.etiqueta.split(':')
            self.etiqueta = args[1]

    def save(self, *args, **kwargs):
        self.setNamespace()
        self.setEtiqueta()
        super(Etiqueta, self).save(*args, **kwargs)
    
    class Meta:
        ordering = ('etiqueta',)
        unique_together = ("namespace", "etiqueta")
