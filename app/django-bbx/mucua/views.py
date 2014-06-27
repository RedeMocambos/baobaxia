import json
import re

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.http import HttpResponse

from mucua.models import Mucua, get_available_mucuas, get_default_mucua,get_mucua_from_UUID,get_mucua_info
from repository.models import Repository
from mucua.serializers import MucuaSerializer
from bbx.utils import convertToGB

@api_view(['GET'])
def mucua_list(request, repository=None):
    """
    List all mucuas
    """
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
                print "not found: ", mucua_description
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
def mucua_get_info(request, uuid, repository=None):
    try:     
        mucua = Mucua.objects.get(uuid=uuid)
    except Mucua.DoesNotExist:
        print "not found: ", uuid
        return Response("Mucua not found")
    
    # TODO: it only gets data for local mucua (git annex info/status)
    # TODO: size of repo in string format
    mucua_full = json.loads(get_mucua_info(repository))
    mucua_info = {
        "supported remote types": mucua_full["supported remote types"],
        "local annex size": mucua_full["local annex size"],
        "local annex keys": mucua_full["local annex keys"],
        "available local disk space": mucua_full["available local disk space"],
        }
    size_list = {'megabyte': 'MB',
                 'megabytes': 'MB',
                 'gigabyte': 'GB',
                 'gigabytes': 'GB',
                 'terabyte': 'TB',
                 'terabytes': 'TB'
                 }
    # re to rewrite from textual to abbrev
    rewrite_size = re.compile('^(\d+)\s{1,1}([a-z]+)')
    
    available_disk = rewrite_size.match(mucua_info['available local disk space'])
    local_size = rewrite_size.match(mucua_info['local annex size'])  
            
    mucua_info['available local disk space'] = convertToGB(available_disk.group(1), size_list[available_disk.group(2)])
    mucua_info['local annex size'] = convertToGB(local_size.group(1), size_list[local_size.group(2)])
    
    return Response(mucua_info)
