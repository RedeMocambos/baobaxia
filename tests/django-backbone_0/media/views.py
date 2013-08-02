from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render, render_to_response, redirect
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from media.models import Media, media_file_name, getFilePath
from etiqueta.models import Etiqueta
from media.forms import MediaForm
from media.serializers import MediaSerializer
from mucua.models import MUCUA_NAME_UUID
from bbx.settings import DEFAULT_MUCUA, DEFAULT_REPOSITORY
import datetime
import os
import subprocess
import uuid
from os import path
import mimetypes

from mucua.models import Mucua
from gitannex.models import Repository

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
        redirect_url = "http://localhost:8000/"  # TODO: tirar
        
        # REPOSITORIO: verifica se existe no banco, senao pega a default
        repository_list = Repository.objects.filter(repositoryName = repository)
        if repository_list:
            repository = repository_list[0]
        else:
            repository_list = Repository.objects.filter(repositoryName = DEFAULT_REPOSITORY)
            repository = repository_list[0]
            redirect_page = True
                
        # MUCUA: verifica se existe no banco, senao pega a default
        mucua_list = Mucua.objects.filter(description = mucua)
        if mucua_list:
            mucua = mucua_list[0]
        else:
            mucua_list = Mucua.objects.filter(description = DEFAULT_MUCUA)
            mucua = mucua_list[0]
            redirect_page = True
            
        # redirect
        if redirect_page:
            return HttpResponseRedirect(redirect_url + repository.repositoryName + '/' + mucua.description + '/medias/')
        
        # listagem de conteudo
        medias = Media.objects.all()
        medias = medias.filter(repository = repository.id)
        medias = medias.filter(origin = mucua.id)
        
        # pega args da url se tiver
        if args:
            for tag in args.split('/'):
                medias = medias.filter(tags__etiqueta__iexact = tag)
        
        serializer = MediaSerializer(medias, many=True)
        return Response(serializer.data)
    

@api_view(['GET', 'PUT', 'DELETE', 'POST'])
def media_detail(request, repository, mucua, pk = None, format=None):
    """
    Retrieve, create, update or delete a media instance.
    """         
    
    if pk:
        try:
            media = Media.objects.get(uuid=pk)
        except Media.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if pk == None:
            return False
        serializer = MediaSerializer(media)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = MediaSerializer(media, data=request.DATA)
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
        # $ curl -F "title=teste123" -F "tags=entrevista" -F "comment=" -F "license=" -F "date=2013/06/07" -F "type=imagem" -F "mediafile=@img_0001.jpg" -X POST http://localhost:8000/redemocambos/dandara/media/ > /tmp/x.html          
        # create a temporary media for handling the file
        mucua = Mucua.objects.get(description = mucua)
        if not mucua:
            return False
        
        repository = Repository.objects.get(repositoryName = repository)
        
        if not repository:
            return False
        
        # TODO: get author (url?)
        author = User.objects.get(pk = 1)
        if not author:
            return False
        
        instance = Media(repository = repository, 
                         origin = mucua,
                         uuid = uuid.uuid4(), 
                         author = author, 
                         title = request.DATA['title'], 
                         comment = request.DATA['comment'],
                         type = request.DATA['type'],
                         license = request.DATA['license'],
                         date = request.DATA['date'],
                         mediafile = request.FILES['mediafile']
                         )
        
#        instance = handle_uploaded_file(request.FILES['filename'], instance)
        instance.save()
        if instance.id:
        
            # get tags by list or separated by ','
            tags = request.DATA['tags'] if iter(request.DATA['tags']) == True else request.DATA['tags'].split(',')
            for etiqueta in tags:
                etiqueta = Etiqueta.objects.get(etiqueta = etiqueta)
                instance.tags.add(etiqueta)
                
            # TODO: return serialized data
            return Response("ok", status=status.HTTP_201_CREATED)
        else:
            return Response("error while creating media", status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        
        media.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


def handle_uploaded_file(f, instance):
    
    # formats
    accepted_types = {'image/jpeg': 'jpg'}
    content_type = f.content_type
    
    if content_type in accepted_types:
         instance.format = accepted_types[content_type]
    else:
         # TODO: raise error
         print "Erro: arquivo nao aceito"
         return False
    
    # create folder, if not exists
    cwd = getFilePath(instance)
    file_name = media_file_name(instance, '')    
    if not os.path.exists(cwd):
        os.makedirs(cwd)
    
    # write file
    destination = open(os.path.join(cwd, file_name), 'wb+')    
    for chunk in f.chunks():
        destination.write(chunk)
    
    destination.close()
    
    cmd = "git annex add " + file_name
    pipe = subprocess.Popen(cmd, shell=True,
                            cwd=getFilePath(instance))
    pipe.wait()    
    
    instance.mediafile = os.path.join(cwd, file_name)
    return instance
