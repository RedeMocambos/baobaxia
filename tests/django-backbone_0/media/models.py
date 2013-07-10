# -*- coding: utf-8 -*-

from django.db import models

TYPE_CHOICES = ( ('audio', 'audio'), ('imagem', 'imagem'), ('video', 'video'), ('arquivo','arquivo') )
FORMAT_CHOICES = ( ('ogg', 'ogg'), ('webm', 'webm'), ('mp4', 'mp4'), ('jpg','jpg') )

class Media(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    uuid = models.CharField(max_length=36)
    title = models.CharField(max_length=100, blank=True, default='')
    comment = models.TextField(max_length=300)
    author = models.CharField(max_length=100)
    origin = models.CharField(max_length=100)
    type = models.CharField(max_length=14, choices=TYPE_CHOICES, default='arquivo')
    format = models.CharField(max_length=14, choices=FORMAT_CHOICES)
    license = models.CharField(max_length=100)
#    versions = 
#    tags = 
    
    class Meta:
        ordering = ('date',)

# Create your models here.

    # "uuid": "cfb8e07e-49ab-489b-a4da-70ff8f715640",
    # "title": "Himno Zapatista",
    # "author": "EZLN",
    # "origin": "Chiapas - México", 
    # "date": "01/01/1994", 
    # "type": "audio",
    # "format": "ogg",
    # "licence": "Copyleft", 
    # "version": [
    #     "SHA256-s4194893--30de64c2454d2e13d4c77c12c625e61dcc874c4dce1841faf3fa94271fe6ddd3/SHA256-s4194893--30de64c2454d2e13d4c77c12c625e61dcc874c4dce1841faf3fa94271fe6ddd3"
    # ],
    # "tags": [
    #     "zapatista",
    #     "hino",
    #     "público"
    # ]
