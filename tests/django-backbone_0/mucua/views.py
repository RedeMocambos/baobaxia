from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render, render_to_response, redirect
from django.http import HttpResponseRedirect, HttpResponse
from bbx.settings import DEFAULT_MUCUA
from mucua.models import Mucua,getAvailableMucuas,getDefaultMucua
from mucua.serializers import MucuaSerializer

@api_view(['GET'])
def mucua_list(request):
    """
    List all mucuas
    """    
    mucuas = getAvailableMucuas()   # retorna tupla de mucuas
    mucuas_list = []
    for mucua_obj in mucuas:
        mucua_note = mucua_obj[1]
        
        try:
            mucua = Mucua.objects.get(note = mucua_note)
            
        except Mucua.DoesNotExist:
            print "not found: ", mucua_note
            mucua = False
        
        if mucua:
            mucuas_list.append(mucua)
    
    serializer = MucuaSerializer(mucuas_list, many=True)
    
    return Response(serializer.data)

@api_view(['GET'])
def mucua_get_default(request):
    
    mucuas_list = []
    mucuas_list.append(getDefaultMucua())
    serializer = MucuaSerializer(mucuas_list, many=True)
    
    return Response(serializer.data)
