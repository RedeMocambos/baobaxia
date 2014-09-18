from os import path
from datetime import datetime
import json

from rest_framework import status
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.renderers import UnicodeJSONRenderer, BrowsableAPIRenderer
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
from bbx.utils import logger
from mucua.models import Mucua
from repository.models import Repository

redirect_base_url = "/api/"  # TODO: tirar / mover


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

        """
        ====================
        SEARCH ENGINE
        
        -------------
        Sample urls
        
        Valid with the following types of url (TODO: create tests):
        
        [repository]/[mucua]/search/video/quilombo/limit/5
        [repository]/[mucua]/search/orderby/note/limit/10
        [repository]/[mucua]/search/video/quilombo/orderby/title/limit/5
        [repository]/[mucua]/search/video/quilombo/orderby/type/desc/name/asc/limit/5
        [repository]/[mucua]/search/video/quilombo/orderby/author/desc

        TODO: still failling when receives incomplete urls. i.e.:
        [repository]/[mucua]/search/video/quilombo/orderby/title/limit/5
        """
        
        """  if passed, get limiting rules """

        """ TODO: move default_limit to configurable place """
        default_limit = 20
        if (args.find('limit') != -1):
            limiting_str = int(args.split('limit/')[1])
            args = args.split('limit/')[0]
        else:
            limiting_str = default_limit
        
        """ if passed, get ordering rules """
        ordering_str = ''
        if (args.find('orderby/') != -1):
            ordering_terms = args.split('orderby/')[1].split('/')
            ordering_list = []
            counting = 0
            for term in ordering_terms:
                if ((term == 'asc') | (term == 'desc')):
                    if counting == 0:
                        continue
                    ordering_list[-1] += ' ' + term + ' '
                else:
                    if (term != ''):
                        ordering_list.append(term)                               
                counting += 1
        
            ordering_str = ','.join(ordering_list)
            
            args = args.split('orderby/')[0]
        else:
            ordering_str = 'm.name'
        
        """ compose query string for terms """
        term_str = ""
        args = args.rstrip('/')
        if args != '':
            term_index = 0
            for term in args.split('/'):
                term = str(term)
                if (term in [key for (key, type_choice) in getTypeChoices() if
                            term == type_choice]):
                    term_str += ' type LIKE "%' + term + '%"'
                elif term in [key for
                             (key, format_choice) in getFormatChoices() if
                             term == format_choice]:
                    term_str += ' format LIKE "%' + term + '"%"'
                else:
                    if (term_index > 0):
                        term_str += 'AND' 
                    
                    term_str += '( t.name LIKE "%' + term + '%"'
                    term_str += ' OR m.name LIKE "%' + term + '%"'
                    term_str += ' OR m.note LIKE "%' + term + '%")'
                    term_index += 1
                    
                    
        if (len(term_str) > 0):
            term_str = ' AND (' + term_str + ')'
        
        """ exclude the content of own mucua on the network
        TODO: maybe create also an option for including or not the own mucua data """
        if (mucua == 'rede'):
            origin_str = "origin_id!=" + str(this_mucua.id)
        else:
            origin_str = "origin_id=" + str(mucua.id)
        
        sql ='SELECT DISTINCT m.* FROM media_media m LEFT JOIN media_media_tags mt ON m.id = mt.media_id LEFT JOIN tag_tag t ON mt.tag_id = t.id  WHERE (%s AND repository_id = %d) %s ORDER BY %s LIMIT %s' % (origin_str, repository.id, term_str, ordering_str, limiting_str)
        
        medias = Media.objects.raw(sql)
        
        """ sql log
        logger.info('sql: ' + sql)
        """
        
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
    author = request.user

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
            tags = request.DATA['tags'].split(',')
            media.tags.clear()
            for tag in tags:
                if tag:
                    try:
                        tag = tag.strip()
                        tag = Tag.objects.get(name=tag)
                    except Tag.DoesNotExist:
                        tag = Tag.objects.create(name=tag)
                        # TODO: case or proximity check to avoid spelling
                        # errors? Or do people handle this by manual merging &
                        # deletion of tags?
                        tag.save()

                    media.tags.add(tag)

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
        if request.DATA['author'] != '':
            author = request.DATA['author']
        else:
            author = request.user

        try:
            author = User.objects.get(username=author)
        except User.DoesNotExist:
            author = User.objects.get(username=request.user)

        media = Media(repository=repository,
                      origin=mucua,
                      author=author,
                      name=request.DATA['name'],
                      note=request.DATA['note'],
                      type=request.DATA['type'],
                      format=request.FILES['media_file'].name.split('.')[1].lower(),
                      license=request.DATA['license'],
                      date=(request.DATA['date'] if request.DATA['date'] !=
                            '' else datetime.now()),
                      media_file=request.FILES['media_file'],
                      uuid=generate_UUID()
                      )

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
            author=author.id).order_by('-date')[:qtd]
    else:
        medias = Media.objects.filter(
            repository=repository.id
            ).filter(author=author.id).order_by('-date')[:qtd]

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


@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def media_where_is(request, repository, mucua, uuid):
    
    try:
        media = Media.objects.get(uuid=uuid)
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    io = media.where_is()
    data = json.loads(io)
    return Response(data)
