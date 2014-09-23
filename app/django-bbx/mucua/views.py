import json
import re

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.renderers import UnicodeJSONRenderer, BrowsableAPIRenderer

from django.http import HttpResponse
from django.utils.translation import ugettext_lazy as _
from mucua.models import Mucua, get_available_mucuas, get_default_mucua,get_mucua_from_UUID,get_mucua_info,get_mucua_disk
from repository.models import Repository
from mucua.serializers import MucuaSerializer
from bbx.utils import convertToGB, logger

@api_view(['GET'])
def mucua_list(request, repository=None):
    """
    List all mucuas
    """
    
    logger.debug(_(u"Acessing mucuas in repository: %s") % repository)
   
    if repository:
        try:
            repository = Repository.objects.get(name=repository)
        except Repository.DoesNotExist:
            return Response("Repository not found")

    mucuas = get_available_mucuas(None, repository)   # retorna tupla de mucuas
    mucuas_list = []

    if mucuas is None:
        return Response(None)

    for mucua_obj in mucuas:
        if mucua_obj[1] != 'web':
            mucua_description = mucua_obj[1]
            try:
                mucua = Mucua.objects.get(description=mucua_description)
            except Mucua.DoesNotExist:
                return Response("Mucua not found")

            if mucua:
                mucuas_list.append(mucua)

    serializer = MucuaSerializer(mucuas_list, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def mucua_get_default(request):
    mucuas_list = []
    mucuas_list.append(get_default_mucua())
    serializer = MucuaSerializer(mucuas_list, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def mucua_get_by_name(request, name, repository=None):
    try:     
        mucua = Mucua.objects.get(description=name)
    except:
        print "not found: ", 
        return Response("Mucua not found")
    
    serializer = MucuaSerializer(mucua, many=False)
    
    return Response(serializer.data)


@api_view(['GET'])
def mucua_get_info(request, uuid, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except Mucua.DoesNotExist:
        print "not found: ", uuid
        return Response("Mucua not found")
    
    # TODO: it only gets data for local mucua (git annex info/status)
    # TODO: size of repo in string format

    rewrite_size = re.compile('^([0-9\.]+)\s([a-z]*)\s*')
    re_crop_unit = re.compile('([[0-9\.]+)')
    size_list = {'megabyte': 'MB',
                 'megabytes': 'MB',
                 'gigabyte': 'GB',
                 'gigabytes': 'GB',
                 'terabyte': 'TB',
                 'terabytes': 'TB'
                 }
    
    mucua_full = json.loads(get_mucua_info(repository))
    size, used = get_mucua_disk()
    mucua_info = {
        "local annex size": mucua_full["local annex size"],
        "local annex keys": mucua_full["local annex keys"],
        "available local disk space": str(used) + 'GB',
        "total disk space": str(size) + 'GB',
        "local used by other": 0,
        }

    # re to rewrite from textual to abbrev
    local_annex_size = rewrite_size.match(mucua_info['local annex size'])
    
    mucua_info['local annex size'] = convertToGB(
        str(float(local_annex_size.group(1))), size_list[local_annex_size.group(2)])
    mucua_info['local used by other'] = str(
        round(
            used - float(re_crop_unit.match(mucua_info['local annex size']).group(1))
        , 2)) + 'GB'
    
    mucua_info['mucua_groups'] = mucua.get_groups(repository)
    
    return Response(mucua_info)


@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_get_groups(request, uuid=None, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        print "not found: ", 
        return Response("Mucua not found")
    
    io = mucua.get_groups(repository)
    return Response(io)

@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_del_group(request, uuid, group, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        print "not found: ", 
        return Response("Mucua not found")
    
    mucua.del_group(group, repository)
    return Response("Group " + group + " deleted")

@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_add_group(request, uuid, group, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        print "not found: ", 
        return Response("Mucua not found")
    
    mucua.add_group(group, repository)
    return Response("Group " + group + " added")
