# -*- coding: utf-8 -*-

from django.db import models

# REPOSITORY_CHOICE é uma tupla com repositorios dentro da pasta /annex

REPOSITORY_CHOICES = [ ('redemocambos', 'redemocambos'), ('sarava', 'sarava'), ('m0c4mb0s', 'm0c4mb0s') ]

class Repositorio(models.Model):
    uuid = models.ManyToManyField('mucua.Mucua', symmetrical=True)
    note = models.TextField(max_length=300)
    name = models.CharField(max_length=100, choices=REPOSITORY_CHOICES, default='redemocambos', unique=True)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        ordering = ('name',)

