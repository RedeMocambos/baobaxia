from rest_framework.decorators import api_view
from rest_framework.response import Response
from mucua.models import Mucua, get_available_mucuas, get_default_mucua
from repository.models import Repository
from mucua.serializers import MucuaSerializer


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
