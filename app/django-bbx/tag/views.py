# -*- coding: utf-8 -*-
import os
import json

from rest_framework import status
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.decorators import authentication_classes, permission_classes

from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
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
        tags = Tag.objects.all().filter(media__origin__isnull=False).annotate(tag_count=Count('name'))        
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
    busca tags a partir de uma string / fragmento    
    """
    logger.info(mucua)
    logger.info(args)

    # hack pra funcionar autocomplete
    # recebe também urls como /[repo]/[mucua]/tags/search/?q=[args]
    args_q = request.GET.get('q')
    if args_q != None:
        args = args_q
    
    # limpa url e pega argumentos
    args = args.split('/sort')[0]
    args = args.split('/limit')[0]
    args = args.split('/')
    
    for tag in args:
        tags = Tag.objects.all().filter(name__contains = tag)
    
    if args_q != None:
        response_data = []
        for t in tags:
            response_data.append(t.name) 
        return HttpResponse(json.dumps(response_data), mimetype=u'application/json')
    else:
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def search_related_tags(request, repository, mucua, args):
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

@api_view(['GET'])
@authentication_classes((SessionAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated,))
def check_functional_tags(request, tags):
    """
    verifica se existem tags funcionais para as tags passadas
    e que tipo são

    caso verdadeiro, retorna as funcionalidades
    """
    response_data = {}
    functional_tags_folder = os.path.join(os.path.dirname(__file__), 'functional_tags')
    
    tags = tags.split('/')
    for tag in tags:
        if os.path.isdir(os.path.join(functional_tags_folder, tag)):
            if os.path.isfile(os.path.join(functional_tags_folder, tag, tag + '.json')):
                descriptor = os.path.join(functional_tags_folder, tag, tag + '.json')
                with open(descriptor) as json_data:
                    content = json.load(json_data)
                    json_data.close()

                response_data[tag] = {}
                response_data[tag]['description'] = content['description']
                response_data[tag]['code'] = _get_functional_tag(tag)
            else:
                response_data[tag] = {}
                response_data[tag]['error'] = 'Functional tag\'s json descriptor not provided!'
        else:
            logger.info('no functionalities for tag: ' +  tag)
    

    
    return HttpResponse(json.dumps(response_data), mimetype=u'application/json')

def _get_functional_tag(tag):
    code = {}
    functional_tags_folder = os.path.join(os.path.dirname(__file__), 'functional_tags');
    
    IGNORE_FILES = ('README')

    code_files = []

    # lista todos os arquivos de codigo da pasta
    # TODO: tirar o 'interface' hard
    interface_folder = os.path.join(functional_tags_folder, tag, 'interface')
    for filename in os.listdir(interface_folder):
        if os.path.isfile(os.path.join(interface_folder,filename)) and filename not in IGNORE_FILES:
            name = filename.rsplit('.', 1)[0]
            with open(os.path.join(interface_folder, filename), 'r') as f:
                main_data = f.read()
                f.closed
                logger.info(main_data)

                code[name] = main_data
    
    return code
