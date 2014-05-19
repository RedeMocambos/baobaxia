from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.contrib.auth.models import User

from mocambola.serializers import UserSerializer


@api_view(['GET'])
def mocambola_list(request, repository, mucua):
    # retorna lista de mocambolas
    return Response('')


@api_view(['GET'])
def mocambola_detail(request, repository, mucua, mocambola):
    # retorna detalhes do user

    try:
        user = User.objects.get(username=mocambola)
    except User.DoesNotExist:
        return Response('Usuario inexistente.')

    # TODO: verificar questao abaixo:
    #  atualmente, esta serializando o user
    #  possivelmente, teria que ter um serializer especifico para mocambola
    #  deixando em aberto

    # serializa e da saida
    serializer = UserSerializer(user)
    return Response(serializer.data)
