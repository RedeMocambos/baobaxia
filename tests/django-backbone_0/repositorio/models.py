# -*- coding: utf-8 -*-

from django.db import models

# REPOSITORY_CHOICE é uma tupla com repositorios dentro da pasta /annex

REPOSITORY_CHOICES = ( ('redemocambos', 'redemocambos'), ('sarava', 'sarava'), ('m0c4mb0s', 'm0c4mb0s') )

class Repositorio(models.Model):
    uuid = models.ManyToManyField(Mucua)
    note = models.TextField(max_length=300)
    origin = models.CharField(max_length=100)
    name = models.CharField(max_length=100, choices=REPOSITORY_CHOICES, default='redemocambos', unique=True)
    media = models.ManyToManyField(Media)
    
    class Meta:
        ordering = ('name',)

