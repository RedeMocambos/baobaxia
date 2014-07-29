from os import path
from datetime import datetime

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sorl.thumbnail import get_thumbnail

from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.context_processors import csrf
from django.template import Template, RequestContext

from media.models import Media, generate_UUID
from tag.models import Tag
from media.serializers import MediaSerializer
from media.models import getTypeChoices, getFormatChoices
from bbx.settings import DEFAULT_MUCUA, DEFAULT_REPOSITORY
from mucua.models import Mucua
from repository.models import Repository

redirect_base_url = "http://localhost/api/"  # TODO: tirar / mover


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
        if mucua == 'rede':
            # get actual mucua for excluding it
            this_mucua = Mucua.objects.get(description=DEFAULT_MUCUA)
        else:
            try:
                mucua = Mucua.objects.get(description=mucua)
            except Mucua.DoesNotExist:
                mucua = Mucua.objects.get(description=DEFAULT_MUCUA)
                redirect_page = True

        try:
            repository = Repository.objects.get(name=repository)
        except Repository.DoesNotExist:
            repository = Repository.objects.get(name=DEFAULT_REPOSITORY)
            redirect_page = True

        # redirect
        if redirect_page:
            return HttpResponseRedirect(redirect_base_url + repository.name +
                                        '/' + mucua.description +
                                        '/bbx/search/')

        # TODO LOW: futuramente, otimizar query de busca - elaborar quer
        
        # listagem de conteudo filtrando por repositorio e mucua
        if mucua == 'rede':
            medias = Media.objects.filter(
                repository=repository.id
            ).exclude(origin=this_mucua.id)
        else:
            medias = Media.objects.filter(
                repository=repository.id
            ).filter(origin=mucua.id)
        # sanitizacao -> remove '/' do final
        args = args.rstrip('/')
        
        # pega args da url se tiver
        if args:
            for arg in args.split('/'):
                # verifica se a palavra eh tipo, formato ou tag e filtra
                if arg in [key for
                           (key, type_choice) in getTypeChoices() if
                           arg == type_choice]:
                    medias = medias.filter(type__iexact=arg)
                elif arg in [key for
                             (key, format_choice) in getFormatChoices() if
                             arg == format_choice]:
                    medias = medias.filter(format__iexact=arg)
                else:
                    medias = medias.filter(
                        Q(tags__name__icontains=arg) |
                        Q(name__icontains=arg) | 
                        Q(note__icontains=arg)
                        ).distinct()
        
        # serializa e da saida
        serializer = MediaSerializer(medias, many=True)
        return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE', 'POST'])
def media_detail(request, repository, mucua, pk=None, format=None):
    """
    Retrieve, create, update or delete a media instance.
    """

    # pegando sessao por url
    redirect_page = False

    try:
        mucua = Mucua.objects.get(description=mucua)
    except Mucua.DoesNotExist:
        mucua = Mucua.objects.get(description=DEFAULT_MUCUA)
        redirect_page = True

    try:
        repository = Repository.objects.get(name=repository)
    except Repository.DoesNotExist:
        repository = Repository.objects.get(name=DEFAULT_REPOSITORY)
        redirect_page = True

    # redirect
    if redirect_page:
        return HttpResponseRedirect(redirect_base_url + repository.name +
                                    '/' + mucua.description + '/media/')

    # TODO: get author (url?)
    author = User.objects.get(pk=1)
    if pk:
        try:
            media = Media.objects.get(uuid=pk)
        except Media.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if pk == '':
            # acessa para inicializar tela de publicaocao de conteudo / gera
            # token
            c = RequestContext(request, {'autoescape': False})
            c.update(csrf(request))
            t = Template('{ "csrftoken": "{{ csrf_token  }}" }')
            return HttpResponse(t.render(c), mimetype=u'application/json')

        if pk != '':
            serializer = MediaSerializer(media)
            return Response(serializer.data)

    elif request.method == 'PUT':
        if pk == '':
            return HttpResponseRedirect(
                redirect_base_url + repository.name + '/' +
                mucua.description + '/bbx/search')
        media.name = request.DATA['name']
        media.note = request.DATA['note']
        media.type = request.DATA['type']
        media.license = request.DATA['license']
        media.date = request.DATA['date']

        media.save()
        if media.id:
            tags = (request.DATA['tags'] if iter(request.DATA['tags']) else
                    request.DATA['tags'].split(','))
            media.tags.clear()
            for tag in tags:
                if tag != '':
                    try:
                        tag = Tag.objects.get(name=tag)
                    except Tag.DoesNotExist:
                        tag = Tag.objects.create(name=tag)
                        tag.save()

                    media.tags.add(tag)

            # TODO: return serialized data
            return Response("updated media - OK",
                            status=status.HTTP_201_CREATED)
        else:
            return Response("error while creating media",
                            status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        """
        create a new media
        """
        default_user = 'a@namaste-laptop.mocambos.net'  # TODO: tirar
        if request.DATA['author'] != '':
            author = request.DATA['author']
        else:
            author = default_user

        try:
            author = User.objects.get(username=author)
        except User.DoesNotExist:
            #print ("media.author: " + media.author + " / default_user" +
            #       default_user)
            author = User.objects.get(username=default_user)

        media = Media(repository=repository,
                      origin=mucua,  # request.DATA['origin'],
                      author=author,
                      name=request.DATA['name'],
                      note=request.DATA['note'],
                      type=request.DATA['type'],
                      license=request.DATA['license'],
                      date=(request.DATA['date'] if request.DATA['date'] !=
                            '' else datetime.now()),
                      media_file=request.FILES['media_file'],
                      uuid=generate_UUID()
                      )

        # Linha curl mista para testar upload E mandar data
        # $ curl -F "name=teste123" -F "tags=entrevista" -F "note="
        # -F "license=" -F
        # "date=2013/06/07" -F "type=imagem" -F "mediafile=@img_0001.jpg"
        # -X POST
        # http://localhost:8000/redemocambos/dandara/media/ > /tmp/x.html

        media.save()
        if media.id:
            # get tags by list or separated by ','
            tags = (request.DATA['tags'] if iter(request.DATA['tags'])
                    else request.DATA['tags'].split(','))
            for tag_name in tags:
                try:
                    if tag_name.find(':') > 0:
                        args = tag.split(':')
                        tag_name = args[1]
                    tag = Tag.objects.get(name=tag_name)
                except Tag.DoesNotExist:
                    tag = Tag.objects.create(name=tag_name)
                    tag.save()

                media.tags.add(tag)
            media.save()  # salva de novo para chamar o post_save
            # TODO: return serialized data
            serializer = MediaSerializer(media)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response("error while creating media",
                            status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':

        media.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def media_last(request, repository, mucua, qtd=5):
    """
    List the last added medias
    """
    try:
        mucua = Mucua.objects.get(description=mucua)
    except Mucua.DoesNotExist:
        mucua = Mucua.objects.get(description=DEFAULT_MUCUA)

    try:
        repository = Repository.objects.get(name=repository)
    except Repository.DoesNotExist:
        repository = Repository.objects.get(name=DEFAULT_REPOSITORY)

    medias = Media.objects.filter(
        repository=repository.id
    ).filter(origin=mucua.id).order_by('-date')[:qtd]
    # serializa e da saida
    serializer = MediaSerializer(medias, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def media_by_mocambola(request, repository, mucua, username, qtd=5):
    if mucua != 'all':
        try:
            mucua = Mucua.objects.get(description=mucua)
        except Mucua.DoesNotExist:
            mucua = Mucua.objects.get(description=DEFAULT_MUCUA)
            redirect_page = True        
    
    try:
        repository = Repository.objects.get(name=repository)
    except Repository.DoesNotExist:
        repository = Repository.objects.get(name=DEFAULT_REPOSITORY)
    
    try:
        author = User.objects.get(username=username)
    except User.DoesNotExist:
        print 'user not exists'
    
    if mucua != 'all':
        medias = Media.objects.filter(
            repository=repository.id
            ).filter(origin=mucua.id).filter(
            author = author.id).order_by('-date')[:qtd]
    else:
        medias = Media.objects.filter(
            repository=repository.id
            ).filter(author = author.id).order_by('-date')[:qtd]

    # serializa e da saida
    serializer = MediaSerializer(medias, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def show_image(request, repository, mucua, uuid, width, height, format_type):
    
    try:
        media = Media.objects.get(uuid=uuid)
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    print media.media_file
    image = get_thumbnail(media.media_file, str(width) + 'x' + str(height),
                          crop='center', quality=99)

    print path.join(image.url)
    return Response(True)


@api_view(['GET'])
def media_url(request, repository, mucua, uuid):
    
    try:
        media = Media.objects.get(uuid=uuid)
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(media.get_url())
