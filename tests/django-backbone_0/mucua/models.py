# -*- coding: utf-8 -*-

from django.db import models
#from repository.models import Repository
from django.conf import settings

# MUCUA_NAME_UUID é uma tupla com nome e uuid da mucua (pode ler do settings.py)

# MUCUA_NAME_UUID = settings.MUCUA_NAME_UUID

MUCUA_NAME_UUID = [ ('a30a926a-3a8c-11e2-a817-cb26bd9bc8d3','dandara'), ('0492621a-4195-11e2-b8c7-43de40a4e11c','acotirene') ]

class Mucua(models.Model):
    description = models.CharField(max_length=100, editable=False)
    note = models.TextField(max_length=300, blank=True)
    uuid = models.CharField(max_length=36, choices=MUCUA_NAME_UUID, default='dandara')
#    repository = models.ForeignKey(Repository)

    def save(self, *args, **kwargs):
        self.description = [a for a in MUCUA_NAME_UUID if a[0] == self.uuid][0][1]
        super(Mucua, self).save(*args, **kwargs) # Call the "real" save() method.
    
    def __unicode__(self):
        return self.description

    class Meta:
        ordering = ('description',)
                

        

