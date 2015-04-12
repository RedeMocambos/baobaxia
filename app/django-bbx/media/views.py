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
from django.utils.translation import ugettext_lazy as _

from media.models import Media, generate_UUID
from tag.models import Tag
from media.serializers import MediaSerializer
from media.models import getTypeChoices, getFormatChoices
from bbx.settings import DEFAULT_MUCUA, DEFAULT_REPOSITORY
from bbx.utils import logger
from mucua.models import Mucua
from repository.models import Repository
from repository.models import git_annex_list_tags, git_annex_add_tag
from repository.models import git_annex_remove_tag

redirect_base_url = "/api/"  # TODO: tirar / mover


# Utility function for adding tags and synchronizing to git-annex.
# TODO: Move to separate library, e.g. "util.py", when refactoring.
def add_and_synchronize_tags(media, tags, mucua):
    """
    Add tags to media, synchronize with git-annex repository.
    """
    # Remove tags that originate in this mucua
    for tag in media.tags.filter(namespace__contains=mucua.uuid):
        media.tags.remove(tag)
    # Now add each tag in list.
    for tag in tags:
        if not tag or tag.isspace():
            continue
        try:
            tag = tag.strip()
            tag = Tag.objects.get(name=tag,
                                  namespace__contains=mucua.uuid)
        except Tag.DoesNotExist:
            tag = Tag(name=tag)
            # TODO: Handle namespaces!
            tag.save()

        media.tags.add(tag)
    # Synchronize tags
    # First, add new ones as metadata on files.
    tags = media.tags.all()
    existing_tags = git_annex_list_tags(media)
    for t in media.tags.all():
        if (t.namespace, t.name) not in existing_tags:
            git_annex_add_tag(media, t.namespace, t.name)
    # Then, *remove* tags that are no longer present. 
    # Only remove tags set with present namespace!
    for namespace, name in existing_tags:
        if namespace.startswith(mucua.uuid)  and not (namespace, name) in [
            (t.namespace, t.name) for t in tags
        ]:
            git_annex_remove_tag(media, namespace, name)


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
        params = []
        return_count = False

        # se passado na url, retorna apenas listagem (count como palavra reservada)
        if (args.find('count') != -1):
            args = args.split('count')[0]
            return_count = True
        
        default_limit = 20
        limiting_params = []
        if (args.find('limit') != -1):
            limiting_params = args.split('limit/')[1].split('/')
            limiting_params = [ int(x) for x in limiting_params ]
            args = args.split('limit/')[0]
        else:
            limiting_params.append(default_limit)

        
        """ if passed, get ordering rules """
        ordering_sql = ''
        ordering_params = []
        default_ordering = 'name ASC'
        if (args.find('orderby/') != -1):
            ordering_terms = args.split('orderby/')[1].split('/')
            ordering_list = []
            counting = 0
            
            """ as ordering must not be passed as wildchar, we're filtering the input """
            accepted_ordering = ['uuid', 'name', 'date', 'note', 'type', 'author', 'origin', 'format', 'license', 'repository', 'is_local', 'is_requested', 'num_copies']
            """ hack: author and origin must be django objects, but here will assume string form """
            hack_fields = ['author', 'origin']
            for term in ordering_terms:
                if ((term == 'asc') | (term == 'desc')):
                    if counting == 0:
                        continue
                    ordering_sql += ' ' + term + ','
                else:
                    if (term in accepted_ordering):
                        if (term in hack_fields):
                            term = '_' + term
                        ordering_sql += term

                counting += 1
                
            if ordering_sql != '':
                if ordering_sql[-1] == ',':
                    ordering_sql = ordering_sql[:-1]
            else:
                ordering_sql = default_ordering
                
            args = args.split('orderby/')[0]
        else:
            ordering_sql = default_ordering
        
        origin_sql = ""
        """ if mucua, filter it """
        if (mucua != 'rede'):
            origin_sql = "origin_id=? AND "
            params.append(mucua.id)
        
        """ appends repository id """
        params.append(repository.id)

        """ compose query string for terms """
        term_sql = ""
        args = args.rstrip('/')
        if args != '':
            term_index = 0
            for term in args.split('/'):
                term = str(term.encode('utf-8'))
                if (term in [key for (key, type_choice) in getTypeChoices() if
                            term == type_choice]):
                    if (term_index > 0):
                        term_sql += " AND " 
                    term_sql += " type LIKE ? "
                    params.append("%" + term + "%")
                    
                elif term in [key for
                             (key, format_choice) in getFormatChoices() if
                             term == format_choice]:
                    term_sql += " format LIKE ? "
                    params.append("%" + term + "%")
                else:
                    if (term_index > 0):
                        term_sql += " AND " 
                        
                    term_sql += " ( t.name LIKE ? "
                    term_sql += " OR m.name LIKE ?"
                    term_sql += " OR m.note LIKE ? )"
                    params.append("%" + term + "%")
                    params.append("%" + term + "%")
                    params.append("%" + term + "%")
                    
                    
                term_index += 1
                    
        if (len(term_sql) > 0):
            term_sql = ' AND (' + term_sql + ')'

        if return_count:
            sql = "SELECT \
            m.id, \
            count(DISTINCT m.uuid) as count "

        else :
            sql = "SELECT DISTINCT \
            m.*, \
            u.username AS _author, \
            mu.description AS _origin "
        
        sql += "FROM \
          media_media m \
        LEFT JOIN media_media_tags mt \
          ON m.id = mt.media_id \
        LEFT JOIN tag_tag t \
          ON mt.tag_id = t.id \
        LEFT JOIN auth_user u  \
          ON u.id = m.author_id  \
        LEFT JOIN mucua_mucua mu \
          ON mu.id = m.origin_id \
        WHERE (" + origin_sql + " repository_id = ? ) " + term_sql

        if not return_count:
            sql += "ORDER BY " + ordering_sql

        if len(limiting_params) == 1:
            sql += " LIMIT ?"
        else:
            sql += " LIMIT ?,?"
        
        sql = sql.decode('utf-8')
        params.extend(limiting_params)
        medias = Media.objects.raw(sql, params)
        
        """ sql log
        logger.info('sql: ' + sql)
        """
        
        # serializa e da saida
        if (return_count):
            response_count = {
                'count': medias[0].count
            }
            return HttpResponse(json.dumps(response_count), mimetype=u'application/json')
        
        else:
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
        # get media
        
        try:
            media = Media.objects.get(uuid=pk)
        except Media.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if pk == '':
            media_token(request, repository, mucua)

        if pk != '':
            serializer = MediaSerializer(media)
            return Response(serializer.data)

    elif request.method == 'PUT':
        # update media
        
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
            add_and_synchronize_tags(media, tags, mucua)
            
            return Response(_("updated media - OK"),
                            status=status.HTTP_201_CREATED)
        else:
            return Response(_("error while creating media"),
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
    
        try:
            mucua = Mucua.objects.get(description=request.DATA['origin'])
        except Mucua.DoesNotExist:
            mucua = Mucua.objects.get(description=DEFAULT_MUCUA)
        
        media = Media(repository=repository,
                      origin=mucua,
                      author=author,
                      name=request.DATA['name'],
                      note=request.DATA['note'],
                      type=request.DATA['type'],
                      license=request.DATA['license'],
                      date=(request.DATA['date'] if request.DATA['date'] !=
                            '' else datetime.now()),
                      uuid=generate_UUID()
                      )
        
        if request.FILES.getlist('media_file') :
            # multiple upload            
            for filename, file in request.FILES.iteritems():
                media.format=request.FILES[filename].name.split('.')[-1].lower()
                media.media_file=request.FILES[filename]
        
        else:        
            # single upload            
            format=request.FILES['media_file'].name.split('.')[-1].lower(),
            media_file=request.FILES['media_file'],
                                  
        media.save()
        if media.id:
            # get tags by list or separated by ','
            tags = request.DATA['tags'].split(',')
            add_and_synchronize_tags(media, tags, mucua)

            media.save()  # salva de novo para chamar o post_save
            serializer = MediaSerializer(media)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(_("error while creating media"),
                            status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':

        media.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def media_last(request, repository, mucua, limit=5):
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
    ).filter(origin=mucua.id).order_by('-date')[:limit]
    # serializa e da saida
    serializer = MediaSerializer(medias, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def media_token(request, repository, mucua):
    # acessa para inicializar tela de publicaocao de conteudo / gera
    # token
    c = RequestContext(request, {'autoescape': False})
    c.update(csrf(request))
    t = Template('{ "csrftoken": "{{ csrf_token  }}" }')
    return HttpResponse(t.render(c), mimetype=u'application/json')


# TODO: implementar busca filtrando por usuario E tags
@api_view(['GET'])
def media_by_mocambola(request, repository, mucua, username, limit=20):
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
                author=author.id).order_by('-date')[:limit]
    else:
        medias = Media.objects.filter(
            repository=repository.id
        ).filter(author=author.id).order_by('-date')[:limit]

    # serializa e da saida
    serializer = MediaSerializer(medias, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def show_image(request, repository, mucua, uuid, width, height, format_type):
    
    try:
        media = Media.objects.get(uuid=uuid)
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if (width != '') & (height == '00'):
        size = str(width)
    elif (width == '00') & (height != ''):
        size = 'x' + str(height)
    elif (width != '') & (height != ''):
        size = str(width) + 'x' + str(height)
    
    image = get_thumbnail(media.media_file, size,
                          crop='center', quality=99)
    
    return Response({'url': image.url})


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
    
    return Response(media.where_is())

@api_view(['GET'])
#@renderer_classes((BrowsableAPIRenderer))
def media_request_copy(request, repository, mucua, uuid):
    try:
        media = Media.objects.get(uuid=uuid)
        media.request_copy()
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(_(u"Requested media of uuid %(uuid)s") % {'uuid': uuid})

@api_view(['GET'])
#@renderer_classes((BrowsableAPIRenderer))
def media_drop_copy(request, repository, mucua, uuid):
    try:
        media = Media.objects.get(uuid=uuid)
        media.drop_copy()
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(_(u"Dropped media of uuid %(uuid)s") % {'uuid': uuid})


@api_view(['GET'])
#@renderer_classes((BrowsableAPIRenderer))
def media_remove(request, repository, mucua, uuid):
    try:
        media = Media.objects.get(uuid=uuid)
        media.delete()
    except Media.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    return Response(_(u"Removed media of uuid %(uuid)s") % {'uuid': uuid})
