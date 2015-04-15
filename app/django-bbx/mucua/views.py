import json
import re

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.renderers import UnicodeJSONRenderer, BrowsableAPIRenderer

from django.utils.translation import ugettext_lazy as _
from mucua.models import Mucua, get_available_mucuas, get_default_mucua,get_mucua_from_UUID,get_mucua_info,get_mucua_disk
from repository.models import Repository
from mucua.serializers import MucuaSerializer
from bbx.utils import convertToGB, logger
from bbx.settings import DEFAULT_MUCUA

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
                return Response(_("Mucua not found"))

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
        return Response(_("Mucua not found"))
    
    serializer = MucuaSerializer(mucua, many=False)
    
    return Response(serializer.data)


@api_view(['GET'])
def mucua_get_info(request, uuid, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except Mucua.DoesNotExist:
        return Response(_("Mucua not found"))

    if mucua.description != DEFAULT_MUCUA:
        return Response("Error: git annex can only get details from local mucua.")
    # TODO: it only gets data for local mucua (git annex info/status)
    # TODO: size of repo in string format

    rewrite_size = re.compile('^([0-9\.]+)\s([a-z]*)\s*')
    re_crop_unit = re.compile('([[0-9\.]+)')
    size_list = {'bytes': 'B',
                 'kilobytes': 'KB',
                 'megabyte': 'MB',
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
        "available local disk space": str(int(size) - int(used)) + 'GB',
        "total disk space": str(int(size)) + 'GB',
        "local used by other": 0,
        "network size" : mucua_full["size of annexed files in working tree"]
        }

    # re to rewrite from textual to abbrev
    local_annex_size = rewrite_size.match(mucua_info['local annex size'])
    network_size = rewrite_size.match(mucua_info['network size'])
    
    mucua_info['local annex size'] = convertToGB(
        str(float(local_annex_size.group(1))), size_list[local_annex_size.group(2)])
    mucua_info['local used by other'] = convertToGB(
        str(used - float(re_crop_unit.match(mucua_info['local annex size']).group(1))
        ), size_list[network_size.group(2)]
    )
    if mucua_info['local used by other'] < 0:
	mucua_info['local used by other'] = 0

    mucua_info['network size'] =  convertToGB(
        str(float(network_size.group(1))), size_list[network_size.group(2)])
    
    mucua_info['mucua_groups'] = mucua.get_groups(repository)
    
    return Response(mucua_info)


@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_get_groups(request, uuid=None, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        return Response(_("Mucua not found"))
    
    io = mucua.get_groups(repository)
    return Response(io)

@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_del_group(request, uuid, group, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        return Response(_("Mucua not found"))
    
    mucua.del_group(group, repository)
    return Response(_("Group %s deleted" % group))

@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_add_group(request, uuid, group, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        return Response(_("Mucua not found"))
    
    mucua.add_group(group, repository)
    return Response("Group %s added" % group)




@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_get_territory(request, uuid=None, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        return Response(_("Mucua not found"))
    
    io = mucua.get_territory(repository)
    return Response(io)

@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_del_territory(request, uuid, territory, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        return Response(_("Mucua not found"))
    
    mucua.del_territory(territory, repository)
    return Response(_("Territory %s deleted" % territory))

@api_view(['GET'])
@renderer_classes((UnicodeJSONRenderer, BrowsableAPIRenderer))
def mucua_set_territory(request, uuid, territory, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except:
        return Response(_("Mucua not found"))
    
    mucua.set_territory(territory, repository)
    return Response("Territory %s added" % territory)
