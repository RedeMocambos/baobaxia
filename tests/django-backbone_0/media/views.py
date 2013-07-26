from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render, render_to_response, redirect
from django.http import HttpResponseRedirect, HttpResponse
from media.models import Media
from etiqueta.models import Etiqueta
from media.forms import MediaForm
from media.serializers import MediaSerializer
from mucua.models import MUCUA_NAME_UUID
from bbx.settings import DEFAULT_MUCUA, DEFAULT_REPOSITORY
import datetime
import os
import subprocess
import uuid

from mucua.models import Mucua
from gitannex.models import Repository

@api_view(['GET', 'POST'])
def media_list(request, repository, mucua, args=None, format=None):
    """
    List all medias, or create a new media.
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
        # TODO: filtrar os medias por repository
        medias = Media.objects.filter(origin = mucua.id)
        
        # pega args da url se tiver
        if args:
            for tag in args.split('/'):
                medias = medias.filter(tags__etiqueta__iexact = tag)
        
        serializer = MediaSerializer(medias, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        """
        create a new media    
        """
        serializer = MediaSerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()            
            for etiquetaId in request.DATA['tags']:
                etiqueta = Etiqueta.objects.get(pk = etiquetaId)
                serializer.object.tags.add(etiqueta)
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def media_detail(request, pk, format=None):
    """
    Retrieve, update or delete a media instance.
    """              
    try:
        media = Media.objects.get(pk=pk)
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MediaSerializer(media)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = MediaSerializer(media, data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        media.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def upload(request):
    serializer = MediaSerializer(data=request.DATA)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# ...
def publish(request):
    '''
    A publish cuida de criar o form do zero, receber os resultados de um form e criar o media a partir do arquivo.
    Form (sobe arquivo) -> Retorna um form semipreenchido com ja o uuid do media  

    '''
    if request.method == 'POST':
        form = MediaForm(request.POST, request.FILES)
        # form.errors
        if True:
            # file is saved
            print form   # debug
            print ">>> Form is Valid!"
            instance = Media(mediafile = request.FILES['Media'])
            # accepted_types = (('image/jpeg', 'jpg'))
            # if request.FILES['file'].content_type in accepted_types:
            #     instance.type = accepted_types(request.FILES['file'].content_type)
            # else:
            #     # error
            #     return false
        
            # # set folder
        
            # # cria pasta e importa pro git
            instance.save()
            print ">>> Object saved"
            return HttpResponseRedirect('/media/'+instance.uuid)
    else:
        form = MediaForm()
        
    return render(request, 'publish.html', {'form': form})


def handle_uploaded_file(data):
    with open('/tmp/test.bbx', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)






