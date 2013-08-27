# -*- coding: utf-8 -*-

from django.db import models
from bbx.settings import POLICIES_DIR
import json


class Etiqueta(models.Model):
    namespace = models.CharField(max_length=10, blank=True, default='')
    note = models.TextField(max_length=300, blank=True)
    etiqueta = models.CharField(max_length=26)
    policies = models.CharField(max_length=100, choices=self._getPolicies(), default='sync', unique=True)
    
    def _getPolicies(self):
        try: 
            json_data = open(self._getPoliciesFilename())
            data = json.load(json_data)
            json_data.close(self._getPoliciesFilename())
            return data[policies]
        except Etiqueta.PoliciesPersistentDataUnavailable:
            return []

    def _setPolicies(self):
        try: 
            json_data = open(self._getPoliciesFilename())
            data = json.load(json_data)
            data[policies] = etiqueta.policies
            json.dump(data, json_data)
            json_data.close()
        except Etiqueta.PoliciesPersistentDataUnavailable
            
        
    def _getPoliciesFilename(self):
        return POLICIES_DIR +'/'+ etiqueta.getId() + '.json'

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
        self._setPolicies()
        super(Etiqueta, self).save(*args, **kwargs)
    
    class Meta:
        ordering = ('etiqueta',)
        unique_together = ("namespace", "etiqueta")
