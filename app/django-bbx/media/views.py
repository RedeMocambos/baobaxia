from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render, render_to_response, redirect
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.db.models import Q
from media.models import Media, mediaFileName, getFilePath
from tag.models import Tag
from media.forms import MediaForm
from media.serializers import MediaSerializer
from media.models import getTypeChoices, getFormatChoices
from bbx.settings import DEFAULT_MUCUA, DEFAULT_REPOSITORY
import datetime
import os
import subprocess
import uuid
from os import path
import mimetypes

from mucua.models import Mucua
from repository.models import Repository

redirect_base_url = "http://localhost:8000/"  # TODO: tirar / mover

@api_view(['GET'])
def media_list(request, repository, mucua, args=None, format=None):
    """
    List all medias, or search by terms
    """
    
    if request.method == 'GET':        
        """
        list medias
        """
        
        # pegando sessao por url
        redirect_page = False
        
        # REPOSITORIO: verifica se existe no banco, senao pega a default
        try:
            mucua = Mucua.objects.get(description = mucua)        
        except Mucua.DoesNotExist:
            mucua = Mucua.objects.get(description = DEFAULT_MUCUA)
            redirect_page = True

        try:
            repository = Repository.objects.get(name = repository)
        except Repository.DoesNotExist:
            repository = Repository.objects.get(name = DEFAULT_REPOSITORY)
            redirect_page = True        
        
        # redirect
        if redirect_page:
            return HttpResponseRedirect(redirect_base_url + repository.name + '/' + mucua.description + '/bbx/search/')
        
        # TODO LOW: futuramente, otimizar query de busca - elaborar query
        
        # listagem de conteudo filtrando por repositorio e mucua
        medias = Media.objects.filter(repository = repository.id).filter(origin = mucua.id)
        # sanitizacao -> remove '/' do final
        args = args.rstrip('/')
        
        # pega args da url se tiver
        if args:
            for arg in args.split('/'):
                # verifica se a palavra eh tipo, formato ou tag e filtra
                if arg in [key for (key, type_choice) in getTypeChoices() if arg == type_choice]:
                    medias = medias.filter(type__iexact = arg)
                elif arg in [key for (key, format_choice) in getFormatChoices() if arg == format_choice]:
                    medias = medias.filter(format__iexact = arg)
                else:
                    medias = medias.filter(Q(tags__name__icontains = arg ) | Q(name__icontains = arg) | Q(note__icontains = arg)) 
        
        # serializa e da saida
        serializer = MediaSerializer(medias, many=True)
        return Response(serializer.data)
    

@api_view(['GET', 'PUT', 'DELETE', 'POST'])
def media_detail(request, repository, mucua, pk = None, format=None):
    """
    Retrieve, create, update or delete a media instance.
    """         
    
    # pegando sessao por url
    redirect_page = False
    
    try:
        mucua = Mucua.objects.get(description = mucua)        
    except Mucua.DoesNotExist:
        mucua = Mucua.objects.get(description = DEFAULT_MUCUA)
        redirect_page = True
    
    try:
        repository = Repository.objects.get(name = repository)
    except Repository.DoesNotExist:
        repository = Repository.objects.get(name = DEFAULT_REPOSITORY)
        redirect_page = True

    # redirect
    if redirect_page:
        return HttpResponseRedirect(redirect_base_url + repository.name + '/' + mucua.description + '/media/')
    
    # TODO: get author (url?)
    author = User.objects.get(pk = 1)
    
    if pk:
        try:
            media = Media.objects.get(uuid=pk)
        except Media.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if pk == '':
            return HttpResponseRedirect(redirect_base_url + repository.name + '/' + mucua.description + '/bbx/search')
       
        serializer = MediaSerializer(media)
        return Response(serializer.data)

    elif request.method == 'PUT':
        if pk == '':
            return HttpResponseRedirect(redirect_base_url + repository.name + '/' + mucua.description + '/bbx/search')
        media.name = request.DATA['name']
        media.note = request.DATA['note']
        media.type = request.DATA['type']
        media.license = request.DATA['license']
#        media.date = request.DATA['date']
        
        media.save()
        if media.id:        
            tags = request.DATA['tags'] if iter(request.DATA['tags']) == True else request.DATA['tags'].split(',')            
            media.tags.clear()
            for tag in tags:
                try:
                    if tag.find(':') > 0:
                        args = tag.split(':')
                        tag = args[1]
                    tag = Tag.objects.get(tag = tag)
                except Tag.DoesNotExist:
                    tag = Tag.objects.create(tag = tag)
                    tag.save()
                
                media.tags.add(tag)
            
            # TODO: return serialized data
            return Response("updated media - OK", status=status.HTTP_201_CREATED)
        else:
            return Response("error while creating media", status=status.HTTP_400_BAD_REQUEST)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        """
        create a new media    
        """
        
        # Linha curl mista para testar upload E mandar data
        # $ curl -F "name=teste123" -F "tags=entrevista" -F "note=" -F "license=" -F "date=2013/06/07" -F "type=imagem" -F "mediafile=@img_0001.jpg" -X POST http://localhost:8000/redemocambos/dandara/media/ > /tmp/x.html          
        media = Media(repository = repository, 
                      origin = mucua,
                      author = author, 
                      name = request.DATA['name'], 
                      note = request.DATA['note'],
                      type = request.DATA['type'],
                      license = request.DATA['license'],
                      date = request.DATA['date'],
                      mediafile = request.FILES['mediafile']
                      )
        
        media.save()
        if media.id:
            # get tags by list or separated by ','
            tags = request.DATA['tags'] if iter(request.DATA['tags']) == True else request.DATA['tags'].split(',')
            for tag_name in tags:
                try:
                    if tag_name.find(':') > 0:
                        args = tag.split(':')
                        tag_name = args[1]
                        tag_namespace = args[0]
                    tag = Tag.objects.get(name=tag_name)
                except Tag.DoesNotExist:
                    tag = Tag.objects.create(name=tag_name)
                    tag.save()

                media.tags.add(tag)
            media.save() # salva de novo para chamar o post_save
            
            # TODO: return serialized data
            return Response("created media - OK", status=status.HTTP_201_CREATED)
        else:
            return Response("error while creating media", status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        
        media.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def media_last(request, repository, mucua):
    """
    List the last added medias
    """
    try:
        mucua = Mucua.objects.get(description = mucua)        
    except Mucua.DoesNotExist:
        mucua = Mucua.objects.get(description = DEFAULT_MUCUA)
        redirect_page = True
    
    try:
        repository = Repository.objects.get(name = repository)
    except Repository.DoesNotExist:
        repository = Repository.objects.get(name = DEFAULT_REPOSITORY)
        redirect_page = True

    # conf - tirar daqui e colocar num local central
    LAST = 5
    
    medias = Media.objects.filter(repository = repository.id).filter(origin = mucua.id).order_by('-date')[:LAST]
    # serializa e da saida
    serializer = MediaSerializer(medias, many=True)
    return Response(serializer.data)
