# -*- coding: utf-8 -*-

from os import path

from rest_framework import status
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.renderers import UnicodeJSONRenderer, BrowsableAPIRenderer

from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.db.models import Q
from django.db.models import Count
from django.template import Template, RequestContext
from django.utils.translation import ugettext_lazy as _
from django.db import connection

from tag.models import Tag
from tag.serializers import TagSerializer
from media.models import Media
from mucua.models import Mucua
from bbx.settings import DEFAULT_MUCUA, DEFAULT_REPOSITORY
from bbx.utils import logger

@api_view(['GET'])
def mucua_tags(request, repository, mucua):

    """ 
    retorna todas as tags dos conteudos de origem [mucua]
    com quantidade de cada tag -> tag_count
    """
    
    if mucua == 'rede':
        tags = Tag.objects.all().annotate(tag_count=Count('name'))        
    else:
        try:
            this_mucua = Mucua.objects.get(description=mucua)
        except Mucua.DoesNotExist:
            this_mucua = Mucua.objects.get(description=DEFAULT_MUCUA)
        
        tags = Tag.objects.all().filter(media__origin = this_mucua.id).annotate(tag_count=Count('name'))
    
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data)   

@api_view(['GET'])
def search_tags(request, repository, mucua, args):
    """
    a partir de um termo, buscar termos relacionados
    
    2 queries:
    - buscar medias que tem o termo e retornar lista de ids de media
    - puxar todas as tags das medias de lista de ids
    com quantidade de cada tag -> tag_count
    """
    
    # limpa url e pega argumentos
    args = args.split('/sort')[0]
    args = args.split('/limit')[0]
    args = args.split('/')

    try:
        this_mucua = Mucua.objects.get(description=mucua)
    except Mucua.DoesNotExist:
        this_mucua = Mucua.objects.get(description=DEFAULT_MUCUA)

    medias = Media.objects.all().filter(origin = this_mucua.id)

    # busca medias com termos buscados
    for s in args:
        medias = medias.filter(tags__name = s)

    medias_id = ''
    for media in medias:
        medias_id += str(media.id) + ','

    # compõe lista de ids de media
    medias_id = medias_id[:-1]

    # retorna tags da lista de ids gerada acima
    sql = "SELECT t.id, t.name, count(t.name) as tag_count \
    FROM \
    tag_tag t \
    LEFT JOIN \
    media_media_tags mt \
    ON mt.tag_id = t.id \
    LEFT JOIN  \
    media_media m \
    ON m.id = mt.media_id \
    WHERE \
    m.id IN (" + medias_id + ") \
    GROUP BY t.name"
    
    tags =  Tag.objects.raw(sql)
    
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data)

